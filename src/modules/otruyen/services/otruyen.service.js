const otruyenClient = require('../client/otruyen.client');
const otruyenMapper = require('../mapper/otruyen.mapper');
const Story = require('../../story/models/Story');
const Chapter = require('../../chapter/models/Chapter');
const Category = require('../../category/models/Category');
const SyncLog = require('../models/SyncLog');
const { SYNC_STATUS } = require('../../../common/constants');
const logger = require('../../../utils/logger');

class OtruyenService {
  async syncCategories(triggeredBy = 'manual', userId = null) {
    const syncLog = await SyncLog.create({
      type: 'categories',
      status: SYNC_STATUS.RUNNING,
      triggeredBy,
      triggeredByUser: userId,
    });

    try {
      await syncLog.start();

      const apiData = await otruyenClient.getCategories();
      const categories = Array.isArray(apiData) ? apiData : apiData.items || [];

      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const catData of categories) {
        try {
          const categoryData = otruyenMapper.mapCategoryFromAPI(catData);
          if (!categoryData) {
            skipped++;
            continue;
          }

          const existing = await Category.findOne({ slug: categoryData.slug });

          if (existing) {
            Object.assign(existing, categoryData);
            await existing.save();
            updated++;
          } else {
            await Category.create(categoryData);
            created++;
          }
        } catch (itemError) {
          logger.error(`Error syncing category ${catData.slug}:`, itemError.message);
          await syncLog.addError(catData.slug, itemError.message);
        }
      }

      await syncLog.complete({
        totalItems: categories.length,
        processedItems: created + updated + skipped,
        createdItems: created,
        updatedItems: updated,
        skippedItems: skipped,
      });

      logger.info(`Categories sync completed: ${created} created, ${updated} updated, ${skipped} skipped`);

      return {
        success: true,
        created,
        updated,
        skipped,
        total: categories.length,
      };
    } catch (error) {
      await syncLog.fail(error);
      logger.error('Categories sync failed:', error);
      throw error;
    }
  }

  async syncHomeData(triggeredBy = 'manual', userId = null) {
    const syncLog = await SyncLog.create({
      type: 'home',
      status: SYNC_STATUS.RUNNING,
      triggeredBy,
      triggeredByUser: userId,
    });

    try {
      await syncLog.start();

      const homeData = await otruyenClient.getHome();
      const mappedData = otruyenMapper.mapHomeData(homeData);

      let totalCreated = 0;
      let totalUpdated = 0;

      const storyLists = [
        { key: 'featured', stories: mappedData.featured || [] },
        { key: 'latestUpdated', stories: mappedData.latestUpdated || [] },
        { key: 'latestAdded', stories: mappedData.latestAdded || [] },
        { key: 'trending', stories: mappedData.trending || [] },
        { key: 'popular', stories: mappedData.popular || [] },
      ];

      const seenSlugs = new Set();

      for (const list of storyLists) {
        for (const storyData of list.stories) {
          if (seenSlugs.has(storyData.slug)) continue;
          seenSlugs.add(storyData.slug);

          try {
            const existing = await Story.findBySlug(storyData.slug);

            if (existing) {
              Object.assign(existing, storyData);
              if (list.key === 'trending') existing.isTrending = true;
              if (list.key === 'popular' || list.key === 'featured') existing.isPopular = true;
              if (list.key === 'featured') existing.isFeatured = true;
              await existing.save();
              totalUpdated++;
            } else {
              if (list.key === 'trending') storyData.isTrending = true;
              if (list.key === 'popular' || list.key === 'featured') storyData.isPopular = true;
              if (list.key === 'featured') storyData.isFeatured = true;
              await Story.create(storyData);
              totalCreated++;
            }
          } catch (storyError) {
            logger.error(`Error syncing story ${storyData.slug}:`, storyError.message);
            await syncLog.addError(storyData.slug, storyError.message);
          }
        }
      }

      if (mappedData.categories?.length > 0) {
        for (const catData of mappedData.categories) {
          try {
            const existing = await Category.findOne({ slug: catData.slug });
            if (existing) {
              Object.assign(existing, catData);
              await existing.save();
            } else {
              await Category.create(catData);
            }
          } catch (catError) {
            logger.error(`Error syncing category ${catData.slug}:`, catError.message);
          }
        }
      }

      await syncLog.complete({
        totalItems: seenSlugs.size,
        processedItems: totalCreated + totalUpdated,
        createdItems: totalCreated,
        updatedItems: totalUpdated,
      });

      logger.info(`Home data sync completed: ${totalCreated} created, ${totalUpdated} updated`);

      return {
        success: true,
        created: totalCreated,
        updated: totalUpdated,
        total: seenSlugs.size,
      };
    } catch (error) {
      await syncLog.fail(error);
      logger.error('Home data sync failed:', error);
      throw error;
    }
  }

  async syncStory(slug, triggeredBy = 'manual', userId = null) {
    const syncLog = await SyncLog.create({
      type: 'stories',
      status: SYNC_STATUS.RUNNING,
      triggeredBy,
      triggeredByUser: userId,
      metadata: { slug },
    });

    try {
      await syncLog.start();

      const apiData = await otruyenClient.getStoryDetail(slug);
      const storyData = otruyenMapper.mapStoryFromAPI(apiData);

      if (!storyData) {
        throw new Error('Failed to map story data from API');
      }

      const existing = await Story.findBySlug(storyData.slug);
      let story;
      let isNew = false;

      if (existing) {
        Object.assign(existing, storyData);
        existing.lastSyncedAt = new Date();
        story = await existing.save();
      } else {
        story = await Story.create({
          ...storyData,
          lastSyncedAt: new Date(),
        });
        isNew = true;
      }

      const chaptersData = apiData.chapters || apiData.episodes || [];
      const mappedChapters = otruyenMapper.mapChapterListFromAPI(chaptersData, story.sourceId);

      let chaptersCreated = 0;
      let chaptersUpdated = 0;

      for (const chapterData of mappedChapters) {
        try {
          const existingChapter = await Chapter.findOne({
            story: story._id,
            number: chapterData.number,
          });

          if (existingChapter) {
            Object.assign(existingChapter, chapterData);
            await existingChapter.save();
            chaptersUpdated++;
          } else {
            chapterData.story = story._id;
            await Chapter.create(chapterData);
            chaptersCreated++;
          }
        } catch (chapterError) {
          logger.error(`Error syncing chapter ${chapterData.number}:`, chapterError.message);
          await syncLog.addError(chapterData.slug, chapterError.message);
        }
      }

      story.totalChapters = await Chapter.countDocuments({ story: story._id, isPublished: true });
      await story.save();

      await syncLog.complete({
        totalItems: mappedChapters.length + 1,
        processedItems: mappedChapters.length + 1,
        createdItems: isNew ? 1 : 0,
        updatedItems: isNew ? 0 : 1,
      });

      logger.info(`Story ${slug} sync completed: ${chaptersCreated} chapters created, ${chaptersUpdated} chapters updated`);

      return {
        success: true,
        story: story._id,
        isNew,
        chaptersCreated,
        chaptersUpdated,
      };
    } catch (error) {
      await syncLog.fail(error);
      logger.error(`Story ${slug} sync failed:`, error);
      throw error;
    }
  }

  async syncStories(type = 'truyen-tranh', startPage = 1, endPage = 10, triggeredBy = 'manual', userId = null) {
    const syncLog = await SyncLog.create({
      type: 'stories',
      status: SYNC_STATUS.RUNNING,
      triggeredBy,
      triggeredByUser: userId,
      metadata: { type, startPage, endPage },
    });

    try {
      await syncLog.start();

      let totalCreated = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;
      let currentPage = startPage;

      while (currentPage <= endPage) {
        try {
          const apiData = await otruyenClient.getStoryList(type, currentPage);
          const stories = Array.isArray(apiData) ? apiData : apiData.items || [];

          if (stories.length === 0) {
            logger.info(`No more stories found at page ${currentPage}`);
            break;
          }

          for (const storyData of stories) {
            const mapped = otruyenMapper.mapStoryFromAPI(storyData);
            if (!mapped) {
              totalSkipped++;
              continue;
            }

            try {
              const existing = await Story.findBySlug(mapped.slug);

              if (existing) {
                Object.assign(existing, mapped);
                existing.lastSyncedAt = new Date();
                await existing.save();
                totalUpdated++;
              } else {
                await Story.create({
                  ...mapped,
                  lastSyncedAt: new Date(),
                });
                totalCreated++;
              }

              await syncLog.incrementProgress('processed');
            } catch (storyError) {
              logger.error(`Error syncing story ${mapped.slug}:`, storyError.message);
              await syncLog.addError(mapped.slug, storyError.message);
              await syncLog.incrementProgress('processed');
            }
          }

          currentPage++;
        } catch (pageError) {
          logger.error(`Error fetching page ${currentPage}:`, pageError.message);
          await syncLog.addError(`page-${currentPage}`, pageError.message);
          currentPage++;
        }
      }

      await syncLog.complete({
        totalItems: endPage - startPage + 1,
        processedItems: totalCreated + totalUpdated + totalSkipped,
        createdItems: totalCreated,
        updatedItems: totalUpdated,
        skippedItems: totalSkipped,
      });

      logger.info(`Stories sync completed: ${totalCreated} created, ${totalUpdated} updated, ${totalSkipped} skipped`);

      return {
        success: true,
        created: totalCreated,
        updated: totalUpdated,
        skipped: totalSkipped,
      };
    } catch (error) {
      await syncLog.fail(error);
      logger.error('Stories sync failed:', error);
      throw error;
    }
  }

  async syncAll(triggeredBy = 'manual', userId = null) {
    const syncLog = await SyncLog.create({
      type: 'full',
      status: SYNC_STATUS.RUNNING,
      triggeredBy,
      triggeredByUser: userId,
    });

    try {
      await syncLog.start();

      const results = {
        categories: await this.syncCategories(triggeredBy, userId),
        home: await this.syncHomeData(triggeredBy, userId),
      };

      await syncLog.complete({
        totalItems: 3,
        processedItems: 3,
        createdItems: results.categories.created + results.home.created,
        updatedItems: results.categories.updated + results.home.updated,
      });

      return results;
    } catch (error) {
      await syncLog.fail(error);
      logger.error('Full sync failed:', error);
      throw error;
    }
  }

  async getSyncStatus() {
    const latestSyncs = await SyncLog.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: '$type',
        latest: { $first: '$$ROOT' },
        count: { $sum: 1 },
      }},
    ]);

    const runningSync = await SyncLog.getRunningSync();

    return {
      running: runningSync,
      latest: latestSyncs.reduce((acc, item) => {
        acc[item._id] = {
          status: item.latest.status,
          createdAt: item.latest.createdAt,
          completedAt: item.latest.completedAt,
          createdItems: item.latest.createdItems,
          updatedItems: item.latest.updatedItems,
          failedItems: item.latest.failedItems,
          totalCount: item.count,
        };
        return acc;
      }, {}),
    };
  }
}

module.exports = new OtruyenService();

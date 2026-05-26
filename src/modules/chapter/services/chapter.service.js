const Chapter = require('../models/Chapter');
const Story = require('../../story/models/Story');
const ReadingHistory = require('../../reading-history/models/ReadingHistory');
const ApiError = require('../../../common/ApiError');
const { HTTP_STATUS } = require('../../../common/constants');

class ChapterService {
  async getChapterBySlugAndNumber(storySlug, number) {
    const story = await Story.findOne({ slug: storySlug, isHidden: false });
    if (!story) {
      throw ApiError.notFound('Story not found');
    }

    const chapter = await Chapter.findOne({
      story: story._id,
      number: parseFloat(number),
      isPublished: true,
    }).populate('story', 'title slug coverImage author status');

    if (!chapter) {
      throw ApiError.notFound('Chapter not found');
    }

    return { story, chapter };
  }

  async getChapterContent(storySlug, number, userId = null) {
    const { story, chapter } = await this.getChapterBySlugAndNumber(storySlug, number);

    await chapter.incrementViews();

    if (userId) {
      await ReadingHistory.updateProgress(userId, story._id, chapter._id, chapter.number);
    }

    const [prevChapter, nextChapter] = await Promise.all([
      Chapter.getPreviousChapter(story._id, chapter.number),
      Chapter.getNextChapter(story._id, chapter.number),
    ]);

    return {
      story,
      chapter,
      prevChapter: prevChapter
        ? { _id: prevChapter._id, number: prevChapter.number, title: prevChapter.title }
        : null,
      nextChapter: nextChapter
        ? { _id: nextChapter._id, number: nextChapter.number, title: nextChapter.title }
        : null,
    };
  }

  async getPreviousChapter(storySlug, number) {
    const story = await Story.findOne({ slug: storySlug, isHidden: false });
    if (!story) {
      throw ApiError.notFound('Story not found');
    }

    const chapter = await Chapter.getPreviousChapter(story._id, parseFloat(number));

    if (!chapter) {
      throw ApiError.notFound('No previous chapter found');
    }

    return { story, chapter };
  }

  async getNextChapter(storySlug, number) {
    const story = await Story.findOne({ slug: storySlug, isHidden: false });
    if (!story) {
      throw ApiError.notFound('Story not found');
    }

    const chapter = await Chapter.getNextChapter(story._id, parseFloat(number));

    if (!chapter) {
      throw ApiError.notFound('No next chapter found');
    }

    return { story, chapter };
  }

  async markChapterRead(userId, chapterId) {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      throw ApiError.notFound('Chapter not found');
    }

    await ReadingHistory.updateProgress(userId, chapter.story, chapter._id, chapter.number);

    return { message: 'Chapter marked as read' };
  }

  async getChapterHistory(userId, options = {}) {
    const { page = 1, limit = 20 } = options;

    const history = await ReadingHistory.findByUser(userId, {
      page,
      limit,
      includeCompleted: false,
    });

    return history;
  }

  async getChapterById(chapterId) {
    const chapter = await Chapter.findById(chapterId).populate(
      'story',
      'title slug coverImage author'
    );

    if (!chapter) {
      throw ApiError.notFound('Chapter not found');
    }

    return chapter;
  }
}

module.exports = new ChapterService();

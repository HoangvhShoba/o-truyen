const { createSlug } = require('../../../utils/helpers');
const { STORY_STATUS, STORY_TYPES } = require('../../../common/constants');

class OtruyenMapper {
  mapStoryFromAPI(data) {
    if (!data) return null;

    const statusMap = {
      'Đang tiến hành': STORY_STATUS.ONGOING,
      'Đã hoàn thành': STORY_STATUS.COMPLETED,
      'Tạm ngưng': STORY_STATUS.HIATUS,
      'Đã hủy': STORY_STATUS.CANCELLED,
      ongoing: STORY_STATUS.ONGOING,
      completed: STORY_STATUS.COMPLETED,
      hiatus: STORY_STATUS.HIATUS,
      cancelled: STORY_STATUS.CANCELLED,
    };

    const typeMap = {
      'Truyện tranh': STORY_TYPES.TRUYEN_TRANH,
      'Truyện chữ': STORY_TYPES.TRUYEN_CHU,
      'Sáng tác': STORY_TYPES.SANG_TAC,
      'Trinh thám': STORY_TYPES.TRINH_THAM,
      'Ngưng': STORY_TYPES.NGUNG,
      'truyen-tranh': STORY_TYPES.TRUYEN_TRANH,
      'truyen-chu': STORY_TYPES.TRUYEN_CHU,
      'sang-tac': STORY_TYPES.SANG_TAC,
    };

    const author = data.author || data.authors || [];
    const authorName = Array.isArray(author) ? author[0]?.name || 'Unknown' : author?.name || 'Unknown';
    const authorSlug = Array.isArray(author) ? author[0]?.slug || createSlug(authorName) : author?.slug || createSlug(authorName);

    const genres = (data.genres || data.category || []).map((g) => ({
      name: typeof g === 'string' ? g : g.name || g.title || 'Unknown',
      slug: typeof g === 'string' ? createSlug(g) : g.slug || createSlug(g.name || g.title || ''),
    }));

    return {
      title: data.title || data.name || 'Untitled',
      slug: data.slug || createSlug(data.title || data.name || ''),
      originalTitle: data.originalTitle || data.origin_name || '',
      description: this.stripHtml(data.description || data.content || data.summary || ''),
      coverImage: data.thumb || data.cover || data.image || '',
      coverImageOriginal: data.poster || data.cover_original || '',
      status: statusMap[data.status] || STORY_STATUS.ONGOING,
      type: typeMap[data.type] || STORY_TYPES.TRUYEN_TRANH,
      author: {
        name: authorName,
        slug: authorSlug,
      },
      genres,
      alternativeTitles: data.other_names || data.aka || [],
      totalViews: parseInt(data.view || data.views || 0, 10),
      rating: {
        average: parseFloat(data.rating || 0),
        count: parseInt(data.rating_count || data.rate_count || 0, 10),
      },
      totalChapters: parseInt(data.chapters?.length || data.total_chapters || data.episode_count || 0, 10),
      isAdult: data.adult || false,
      source: 'otruyen',
      sourceUrl: data.url || data.source_url || '',
      sourceId: data._id?.toString() || data.id?.toString() || data.slug || '',
      lastChapterAt: data.updated_at ? new Date(data.updated_at) : null,
      translators: data.translators || [],
      tags: data.tags || [],
    };
  }

  mapChapterFromAPI(data, storySourceId) {
    if (!data) return null;

    return {
      title: data.title || data.name || `Chapter ${data.chapter_number || data.number}`,
      number: parseFloat(data.chapter_number || data.number || 1),
      slug: data.slug || createSlug(data.title || `chapter-${data.chapter_number || 1}`),
      content: data.content || data.content_html || '',
      images: data.images || data.pages || [],
      contentHtml: data.content_html || data.content || '',
      totalViews: parseInt(data.views || data.view || 0, 10),
      isPublished: true,
      publishedAt: data.published_at ? new Date(data.published_at) : new Date(),
      sourceUrl: data.url || '',
      sourceId: data._id?.toString() || data.id?.toString() || `${storySourceId}-${data.chapter_number || data.number}`,
    };
  }

  mapCategoryFromAPI(data) {
    if (!data) return null;

    return {
      name: data.name || data.title || 'Unknown',
      slug: data.slug || createSlug(data.name || data.title || ''),
      description: data.description || data.title || '',
      coverImage: data.thumb || data.cover || '',
      sourceId: data._id?.toString() || data.id?.toString() || data.slug || '',
      order: parseInt(data.order || data.sort || 0, 10),
    };
  }

  mapHomeData(homeData) {
    if (!homeData) return null;

    return {
      featured: this.mapStoryListFromAPI(homeData.featured || homeData.slider || []),
      latestUpdated: this.mapStoryListFromAPI(homeData.latest_updated || homeData.new_updated || []),
      latestAdded: this.mapStoryListFromAPI(homeData.latest_added || homeData.new_added || []),
      trending: this.mapStoryListFromAPI(homeData.trending || homeData.hot || []),
      popular: this.mapStoryListFromAPI(homeData.popular || []),
      categories: (homeData.categories || homeData.the_loai || []).map((c) => this.mapCategoryFromAPI(c)),
    };
  }

  mapStoryListFromAPI(stories) {
    if (!Array.isArray(stories)) return [];
    return stories.map((s) => this.mapStoryFromAPI(s)).filter(Boolean);
  }

  mapChapterListFromAPI(chapters, storySourceId) {
    if (!Array.isArray(chapters)) return [];
    return chapters.map((c) => this.mapChapterFromAPI(c, storySourceId)).filter(Boolean);
  }

  stripHtml(html) {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}

module.exports = new OtruyenMapper();

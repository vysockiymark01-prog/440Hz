import { useLocalStorage } from './useLocalStorage.js'

// favorites shape: { articles: [{lectureId, articleId}], terms: [termId] }
const empty = { articles: [], terms: [] }

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage('pt_favorites_v1', empty)

  const isArticleFav = (lectureId, articleId) =>
    favorites.articles.some((a) => a.lectureId === lectureId && a.articleId === articleId)

  const toggleArticle = (lectureId, articleId) => {
    setFavorites((prev) => {
      const exists = prev.articles.some((a) => a.lectureId === lectureId && a.articleId === articleId)
      return {
        ...prev,
        articles: exists
          ? prev.articles.filter((a) => !(a.lectureId === lectureId && a.articleId === articleId))
          : [...prev.articles, { lectureId, articleId }],
      }
    })
  }

  const isTermFav = (termId) => favorites.terms.includes(termId)

  const toggleTerm = (termId) => {
    setFavorites((prev) => ({
      ...prev,
      terms: prev.terms.includes(termId)
        ? prev.terms.filter((t) => t !== termId)
        : [...prev.terms, termId],
    }))
  }

  return { favorites, isArticleFav, toggleArticle, isTermFav, toggleTerm }
}

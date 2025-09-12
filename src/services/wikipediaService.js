import wiki from "wikipedia";

export class WikiService {
    static async search(target) {
        try {
            wiki.setLang('pt');

            const result = await wiki.search(target);
            const title = result.results[0].title;
            const response = await wiki.page(title);
            const summary = await response.summary();

            return {
                success: true,
                data: {
                    content: summary.extract,
                    url: summary.content_urls.desktop.page
                }
            }

        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: "Pesquisa não encontrada."
            }
        }
    }
}

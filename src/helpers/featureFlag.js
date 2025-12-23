export const flags = {
    devMODE(status, { id }) {
        const response = {
            status: status,
            condition: false,
            message: null
        }

        if (!status) return response;

        if (id === process.env.MAIN_GROUP) return response;

        response.condition = true;

        let text = "> ㅤ\n";
        text += "> ⚠️ Serviço indisponível no momento, Por favor, tente novamente mais tarde.\n";
        text += "> ㅤ";

        response.message = text;

        return response;
    }
}

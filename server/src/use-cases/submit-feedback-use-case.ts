import { MailAdapter } from "../adapters/mail-adapter"
import { PrismaFeedbacksRepository } from "../repositories/prisma/prisma-feedbacks-repository"

interface SubmitFeedbackUseCaseRequest {
    type: string,
    comment: string,
    screenshot?: string,
}

export class SubmitFeedbackUseCase {
    constructor(
        private feedbacksRepository: PrismaFeedbacksRepository,
        private mailAdapter: MailAdapter
    ) { }

    async execute(request: SubmitFeedbackUseCaseRequest) {
        const { type, comment, screenshot } = request

        if (!type) {
            throw new Error('Type is required.')
        }

        if (!comment) {
            throw new Error('Comment is requiredd')
        }

        if (screenshot && !screenshot.startsWith('data:image/png;base64')) {
            throw new Error('Inválid screenshot format.')
        }

        await this.feedbacksRepository.create({
            type,
            comment,
            screenshot
        })

        await this.mailAdapter.sendMail({
            subject: 'Novo feedback',
            body: [
                `<div style="font-family: sans-serig; font-size: 16px; color: #111;">`,
                `<p>Tipo de feedback: ${type}</p>`,
                `<p>Comentário: ${comment}</p>`,
                screenshot ? `<img src="${screenshot}" />` : ``,
                `</div>`
            ].join('\n')
        })
    }
}
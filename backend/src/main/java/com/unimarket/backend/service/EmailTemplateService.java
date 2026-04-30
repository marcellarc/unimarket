package com.unimarket.backend.service;

import java.text.NumberFormat;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.unimarket.backend.entity.PriceNotification;

@Service
public class EmailTemplateService {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    public String passwordRecovery(String name, String code, int expirationMinutes) {
        String greetingName = StringUtils.hasText(name) ? name : "tudo bem";
        String content = """
                <p>Olá, <strong>%s</strong>!</p>
                <p>Recebemos uma solicitação para redefinir sua senha no UniMarket.</p>
                <div class="code">%s</div>
                <p>Use este código na tela de recuperação. Ele expira em <strong>%d minutos</strong>.</p>
                <p class="muted">Se você não pediu essa alteração, ignore este e-mail. Sua senha atual continuará a mesma.</p>
                """.formatted(escapeHtml(greetingName), escapeHtml(code), expirationMinutes);

        return baseTemplate("Recuperação de senha", "Seu código chegou!", content);
    }

    public String priceAlert(PriceNotification notification) {
        String productName = notification.getMarketProduct().getProduct().getName();
        String marketName = notification.getMarketProduct().getMarket().getName();
        String currentPrice = formatCurrency(notification.getCurrentPrice());
        String targetPrice = formatCurrency(notification.getTargetPrice());

        String content = """
                <p>Boa notícia: um produto que você acompanha atingiu o preço desejado!</p>
                <div class="product-card">
                    <p class="eyebrow">Produto</p>
                    <h2>%s</h2>
                    <p class="muted">Mercado: <strong>%s</strong></p>
                    <div class="price-row">
                        <div>
                            <span>Preço atual</span>
                            <strong>%s</strong>
                        </div>
                        <div>
                            <span>Preço desejado</span>
                            <strong>%s</strong>
                        </div>
                    </div>
                </div>
                <p>Entre no UniMarket para conferir a disponibilidade antes que o preço mude.</p>
                """.formatted(
                escapeHtml(productName),
                escapeHtml(marketName),
                currentPrice,
                targetPrice
        );

        return baseTemplate("Alerta de preço", "Preço desejado atingido", content);
    }

    private String baseTemplate(String preheader, String title, String content) {
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>UniMarket</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            background: #f4f7fb;
                            color: #152033;
                            font-family: Arial, Helvetica, sans-serif;
                        }
                        .preheader {
                            display: none;
                            max-height: 0;
                            overflow: hidden;
                            opacity: 0;
                        }
                        .wrapper {
                            width: 100%%;
                            padding: 28px 12px;
                            background: #f4f7fb;
                        }
                        .container {
                            max-width: 560px;
                            margin: 0 auto;
                            background: #ffffff;
                            border: 1px solid #e5ebf3;
                            border-radius: 12px;
                            overflow: hidden;
                        }
                        .header {
                            background: #0056df;
                            padding: 24px 28px;
                            color: #ffffff;
                        }
                        .brand {
                            font-size: 14px;
                            font-weight: 700;
                            letter-spacing: 0.4px;
                            text-transform: uppercase;
                        }
                        .header h1 {
                            margin: 12px 0 0;
                            font-size: 24px;
                            line-height: 1.25;
                        }
                        .content {
                            padding: 28px;
                            font-size: 15px;
                            line-height: 1.6;
                        }
                        .code {
                            margin: 22px 0;
                            padding: 18px;
                            border-radius: 10px;
                            background: #eef4ff;
                            border: 1px solid #cfe0ff;
                            color: #0056df;
                            font-size: 32px;
                            line-height: 1;
                            font-weight: 800;
                            letter-spacing: 8px;
                            text-align: center;
                        }
                        .product-card {
                            margin: 22px 0;
                            padding: 18px;
                            border-radius: 10px;
                            background: #f8fafc;
                            border: 1px solid #e5ebf3;
                        }
                        .product-card h2 {
                            margin: 4px 0 8px;
                            font-size: 20px;
                            line-height: 1.25;
                        }
                        .eyebrow {
                            margin: 0;
                            color: #0056df;
                            font-size: 11px;
                            font-weight: 700;
                            letter-spacing: 0.5px;
                            text-transform: uppercase;
                        }
                        .price-row {
                            display: table;
                            width: 100%%;
                            margin-top: 16px;
                        }
                        .price-row div {
                            display: table-cell;
                            width: 50%%;
                            padding-right: 12px;
                        }
                        .price-row span {
                            display: block;
                            color: #667085;
                            font-size: 12px;
                            margin-bottom: 4px;
                        }
                        .price-row strong {
                            color: #0056df;
                            font-size: 22px;
                        }
                        .muted {
                            color: #667085;
                        }
                        .footer {
                            padding: 18px 28px 24px;
                            color: #667085;
                            font-size: 12px;
                            border-top: 1px solid #eef2f7;
                        }
                    </style>
                </head>
                <body>
                    <span class="preheader">%s</span>
                    <div class="wrapper">
                        <div class="container">
                            <div class="header">
                                <div class="brand">UniMarket</div>
                                <h1>%s</h1>
                            </div>
                            <div class="content">
                                %s
                            </div>
                            <div class="footer">
                                Este é um e-mail automático do UniMarket. Não responda esta mensagem.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(escapeHtml(preheader), escapeHtml(title), content);
    }

    private String formatCurrency(Double value) {
        if (value == null) {
            return "Consulte";
        }

        return NumberFormat.getCurrencyInstance(PT_BR).format(value);
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}

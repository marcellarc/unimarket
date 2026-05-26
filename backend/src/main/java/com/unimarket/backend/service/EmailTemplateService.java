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
                <p class="lead">Olá, <strong>%s</strong>!</p>
                <p>Use o código abaixo para redefinir sua senha no UniMarket.</p>

                <div class="code-panel">
                    <span class="code-label">Código de segurança</span>
                    <div class="code">%s</div>
                    <span class="code-note">Válido por %d minutos</span>
                </div>

                <p class="muted">Se você não pediu essa alteração, ignore este e-mail. Sua senha atual continuará protegida.</p>
                """.formatted(escapeHtml(greetingName), escapeHtml(code), expirationMinutes);

        return baseTemplate(
                "Recuperação de senha",
                "Seu código UniMarket",
                "Acesso seguro para continuar comparando preços.",
                content
        );
    }

    public String priceAlert(PriceNotification notification) {
        String productName = notification.getMarketProduct().getProduct().getName();
        String marketName = notification.getMarketProduct().getMarket().getName();
        String currentPrice = formatCurrency(notification.getCurrentPrice());
        String targetNote = formatTargetNote(notification.getCurrentPrice(), notification.getTargetPrice());

        String content = """

                <div class="deal-card">
                    <div class="deal-top">
                        <span class="eyebrow">Alerta UniMarket</span>
                        <span class="status-pill">Alvo atingido</span>
                    </div>

                    <h2>%s</h2>
                    <p class="market-name">Disponível em <strong>%s</strong></p>

                    <div class="hero-price">
                        <span>Agora por</span>
                        <strong>%s</strong>
                        <small>Valor escolhido atingido</small>
                    </div>

                    <p class="target-note">%s</p>
                </div>

                <p class="muted">Abra o UniMarket para conferir disponibilidade e comparar com mercados próximos antes que o valor mude.</p>
                """.formatted(
                escapeHtml(productName),
                escapeHtml(marketName),
                currentPrice,
                escapeHtml(targetNote)
        );

        return baseTemplate(
                "Alerta de preço",
                "Preço desejado atingido!",
                "Um item monitorado ficou dentro do valor que você escolheu!",
                content
        );
    }

    private String baseTemplate(String preheader, String title, String subtitle, String content) {
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
                            background: #eef5ff;
                            color: #172033;
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
                            padding: 32px 12px;
                            background: #eef5ff;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            overflow: hidden;
                            border: 1px solid #dbe7f7;
                            border-radius: 18px;
                            background: #ffffff;
                            box-shadow: 0 18px 42px rgba(0, 42, 105, 0.10);
                        }
                        .brand-strip {
                            height: 8px;
                            background: linear-gradient(90deg, #0056df 0%%, #0056df 72%%, #ffcf37 72%%, #ffcf37 100%%);
                        }
                        .header {
                            padding: 28px 30px 24px;
                            background: #ffffff;
                            border-bottom: 1px solid #edf2f7;
                        }
                        .brand-row {
                            display: table;
                            width: 100%%;
                            margin-bottom: 22px;
                        }
                        .brand-mark {
                            display: table-cell;
                            width: 44px;
                            height: 44px;
                            border-radius: 12px;
                            background: #0056df;
                            color: #ffffff;
                            text-align: center;
                            vertical-align: middle;
                            font-size: 20px;
                            font-weight: 800;
                        }
                        .brand-text {
                            display: table-cell;
                            padding-left: 12px;
                            vertical-align: middle;
                        }
                        .brand-name {
                            margin: 0;
                            color: #0056df;
                            font-size: 16px;
                            font-weight: 800;
                            letter-spacing: 0.2px;
                        }
                        .brand-caption {
                            margin: 2px 0 0;
                            color: #667085;
                            font-size: 12px;
                        }
                        h1 {
                            margin: 0;
                            color: #101828;
                            font-size: 28px;
                            line-height: 1.18;
                            letter-spacing: -0.2px;
                        }
                        .subtitle {
                            margin: 10px 0 0;
                            color: #667085;
                            font-size: 14px;
                            line-height: 1.5;
                        }
                        .content {
                            padding: 28px 30px 30px;
                            font-size: 15px;
                            line-height: 1.65;
                        }
                        .lead {
                            margin-top: 0;
                            color: #172033;
                            font-size: 16px;
                        }
                        .code-panel {
                            margin: 24px 0;
                            padding: 22px;
                            border: 1px solid #cfe0ff;
                            border-radius: 14px;
                            background: #f5f9ff;
                            text-align: center;
                        }
                        .code-label,
                        .code-note {
                            display: block;
                            color: #667085;
                            font-size: 12px;
                            font-weight: 700;
                            letter-spacing: 0.3px;
                            text-transform: uppercase;
                        }
                        .code {
                            margin: 12px 0 10px;
                            color: #0056df;
                            font-size: 38px;
                            line-height: 1;
                            font-weight: 900;
                            letter-spacing: 9px;
                        }
                        .deal-card {
                            margin: 24px 0;
                            padding: 22px;
                            border: 1px solid #dbe7f7;
                            border-radius: 14px;
                            background: #f8fbff;
                        }
                        .deal-top {
                            display: table;
                            width: 100%%;
                            margin-bottom: 10px;
                        }
                        .deal-top .eyebrow,
                        .deal-top .status-pill {
                            display: table-cell;
                            vertical-align: middle;
                        }
                        .status-pill {
                            width: 120px;
                            padding: 6px 10px;
                            border-radius: 999px;
                            background: #eaf2ff;
                            color: #0056df;
                            font-size: 11px;
                            font-weight: 800;
                            text-align: center;
                            text-transform: uppercase;
                        }
                        .deal-card h2 {
                            margin: 6px 0 4px;
                            color: #101828;
                            font-size: 20px;
                            line-height: 1.3;
                        }
                        .market-name {
                            margin: 0 0 18px;
                            color: #667085;
                            font-size: 13px;
                        }
                        .market-name strong {
                            color: #172033;
                        }
                        .eyebrow {
                            color: #0056df;
                            font-size: 11px;
                            font-weight: 800;
                            letter-spacing: 0.6px;
                            text-transform: uppercase;
                        }
                        .hero-price {
                            margin: 20px 0;
                            padding: 22px;
                            border-radius: 14px;
                            background: #0056df;
                            color: #ffffff;
                            text-align: center;
                        }
                        .hero-price span,
                        .hero-price small {
                            display: block;
                            color: rgba(255, 255, 255, 0.78);
                            font-size: 12px;
                            font-weight: 700;
                            letter-spacing: 0.3px;
                            text-transform: uppercase;
                        }
                        .hero-price strong {
                            display: block;
                            margin: 8px 0 6px;
                            color: #ffffff;
                            font-size: 38px;
                            line-height: 1;
                            font-weight: 900;
                        }
                        .target-note {
                            margin: 0;
                            padding: 12px 14px;
                            border: 1px solid #e2ebf7;
                            border-radius: 12px;
                            background: #ffffff;
                            color: #344054;
                            font-size: 13px;
                            line-height: 1.45;
                            text-align: center;
                        }
                        .muted {
                            color: #667085;
                        }
                        .footer {
                            padding: 18px 30px 24px;
                            color: #667085;
                            font-size: 12px;
                            line-height: 1.5;
                            background: #fbfdff;
                            border-top: 1px solid #edf2f7;
                        }
                        .footer strong {
                            color: #0056df;
                        }
                    </style>
                </head>
                <body>
                    <span class="preheader">%s</span>
                    <div class="wrapper">
                        <div class="container">
                            <div class="brand-strip"></div>
                            <div class="header">
                                <div class="brand-row">
                                    <div class="brand-mark">U</div>
                                    <div class="brand-text">
                                        <p class="brand-name">UniMarket</p>
                                        <p class="brand-caption">comparação inteligente para compras reais</p>
                                    </div>
                                </div>
                                <h1>%s</h1>
                                <p class="subtitle">%s</p>
                            </div>
                            <div class="content">
                                %s
                            </div>
                            <div class="footer">
                                <strong>UniMarket</strong> envia este e-mail automaticamente para proteger sua conta e acompanhar seus alertas de preço.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                escapeHtml(preheader),
                escapeHtml(title),
                escapeHtml(subtitle),
                content
        );
    }

    private String formatCurrency(Double value) {
        if (value == null) {
            return "Consulte";
        }

        return NumberFormat.getCurrencyInstance(PT_BR).format(value);
    }

    private String formatTargetNote(Double currentPrice, Double targetPrice) {
        if (currentPrice == null || targetPrice == null) {
            return "O produto entrou dentro do valor que você definiu.";
        }

        double difference = targetPrice - currentPrice;

        if (difference > 0.009) {
            return "Está " + formatCurrency(difference) + " abaixo do valor escolhido.";
        }

        return "Está exatamente no valor que você escolheu.";
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

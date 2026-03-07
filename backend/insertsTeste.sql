-- =========================
-- CATEGORIAS
-- =========================

INSERT INTO categorias (cd_categoria, nm_categoria) VALUES
(1, 'Arroz e Grãos'),
(2, 'Bebidas'),
(3, 'Laticínios'),
(4, 'Higiene'),
(5, 'Limpeza');

-- =========================
-- CLIENTES
-- =========================

INSERT INTO clientes (cd_cliente, nm_cliente, ds_email, ds_senha) VALUES
(1, 'Beatriz Sibilio', 'beatriz@email.com', '123456'),
(2, 'Carlos Souza', 'carlos@email.com', '123456'),
(3, 'Ana Lima', 'ana@email.com', '123456');

-- =========================
-- PRODUTOS
-- =========================

INSERT INTO produtos (cd_produto, nm_produto, nm_marca, vl_preco, ds_imgproduto, cd_categoria) VALUES
(1, 'Arroz Branco 5kg', 'Tio João', 25.90, 'arroz.png', 1),
(2, 'Feijão Carioca 1kg', 'Camil', 8.50, 'feijao.png', 1),
(3, 'Leite Integral 1L', 'Piracanjuba', 4.89, 'leite.png', 3),
(4, 'Coca-Cola 2L', 'Coca-Cola', 9.99, 'coca.png', 2),
(5, 'Sabonete', 'Dove', 3.50, 'sabonete.png', 4);

-- =========================
-- SUPERMERCADOS
-- =========================

INSERT INTO supermercados 
(cd_mercado, nm_mercado, ds_cnpj, ds_email, ds_senha, ds_logradouro, ds_bairro, dt_cadastro, vl_latitude, vl_longitude)
VALUES
(1, 'Supermercado Central', '12345678000199', 'central@email.com', '123456', 'Rua A, 120', 'Centro', NOW(), -24.3200, -46.9980),
(2, 'Mercado Econômico', '98765432000188', 'economico@email.com', '123456', 'Av Brasil, 300', 'Centro', NOW(), -24.3210, -46.9975),
(3, 'Super Mais', '11223344000177', 'supermais@email.com', '123456', 'Rua das Flores, 50', 'Jardim', NOW(), -24.3195, -46.9968);

-- =========================
-- PREÇOS DOS PRODUTOS NOS MERCADOS
-- =========================

INSERT INTO supermercado_produto
(cd_supermercado, cd_produto, vl_preco, qt_estoque, ds_imagem_url, dt_atualizacao)
VALUES
(1, 1, 25.90, 50, 'arroz.png', NOW()),
(1, 2, 8.40, 40, 'feijao.png', NOW()),
(1, 3, 4.99, 80, 'leite.png', NOW()),

(2, 1, 24.50, 60, 'arroz.png', NOW()),
(2, 2, 8.70, 30, 'feijao.png', NOW()),
(2, 4, 9.50, 90, 'coca.png', NOW()),

(3, 1, 26.10, 35, 'arroz.png', NOW()),
(3, 3, 4.79, 70, 'leite.png', NOW()),
(3, 5, 3.30, 120, 'sabonete.png', NOW());

-- =========================
-- LISTAS DE COMPRAS
-- =========================

INSERT INTO lista_compras (cd_lista, cd_cliente, nm_lista, dt_criacao) VALUES
(1, 1, 'Compras do mês', NOW()),
(2, 2, 'Churrasco', NOW());

-- =========================
-- ITENS DA LISTA
-- =========================

INSERT INTO lista_itens (cd_lista, cd_produto, qt_produto) VALUES
(1, 1, 2),
(1, 2, 1),
(1, 3, 6),

(2, 4, 3),
(2, 3, 2);

-- =========================
-- FEEDBACKS
-- =========================

INSERT INTO feedbacks 
(cd_feedback, cd_cliente, cd_produto, vl_nota, ds_comentario, dt_feedback)
VALUES
(1, 1, 1, 5, 'Arroz de ótima qualidade', NOW()),
(2, 2, 4, 4, 'Preço bom comparado a outros mercados', NOW()),
(3, 3, 3, 5, 'Leite muito bom', NOW());
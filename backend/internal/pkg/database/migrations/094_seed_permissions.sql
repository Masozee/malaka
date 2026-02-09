-- +goose Up
-- Migration 094: Seed all permission definitions
-- Convention: module.resource.action

INSERT INTO permissions (id, code, module, resource, action, description) VALUES
-- ===================== MASTERDATA MODULE =====================
(gen_random_uuid(), 'masterdata.company.create', 'masterdata', 'company', 'create', 'Create company'),
(gen_random_uuid(), 'masterdata.company.read', 'masterdata', 'company', 'read', 'View company details'),
(gen_random_uuid(), 'masterdata.company.list', 'masterdata', 'company', 'list', 'List companies'),
(gen_random_uuid(), 'masterdata.company.update', 'masterdata', 'company', 'update', 'Update company'),
(gen_random_uuid(), 'masterdata.company.delete', 'masterdata', 'company', 'delete', 'Delete company'),

(gen_random_uuid(), 'masterdata.user.create', 'masterdata', 'user', 'create', 'Create user'),
(gen_random_uuid(), 'masterdata.user.read', 'masterdata', 'user', 'read', 'View user details'),
(gen_random_uuid(), 'masterdata.user.list', 'masterdata', 'user', 'list', 'List users'),
(gen_random_uuid(), 'masterdata.user.update', 'masterdata', 'user', 'update', 'Update user'),
(gen_random_uuid(), 'masterdata.user.delete', 'masterdata', 'user', 'delete', 'Delete user'),

(gen_random_uuid(), 'masterdata.classification.create', 'masterdata', 'classification', 'create', 'Create classification'),
(gen_random_uuid(), 'masterdata.classification.read', 'masterdata', 'classification', 'read', 'View classification'),
(gen_random_uuid(), 'masterdata.classification.list', 'masterdata', 'classification', 'list', 'List classifications'),
(gen_random_uuid(), 'masterdata.classification.update', 'masterdata', 'classification', 'update', 'Update classification'),
(gen_random_uuid(), 'masterdata.classification.delete', 'masterdata', 'classification', 'delete', 'Delete classification'),

(gen_random_uuid(), 'masterdata.color.create', 'masterdata', 'color', 'create', 'Create color'),
(gen_random_uuid(), 'masterdata.color.read', 'masterdata', 'color', 'read', 'View color'),
(gen_random_uuid(), 'masterdata.color.list', 'masterdata', 'color', 'list', 'List colors'),
(gen_random_uuid(), 'masterdata.color.update', 'masterdata', 'color', 'update', 'Update color'),
(gen_random_uuid(), 'masterdata.color.delete', 'masterdata', 'color', 'delete', 'Delete color'),

(gen_random_uuid(), 'masterdata.article.create', 'masterdata', 'article', 'create', 'Create article'),
(gen_random_uuid(), 'masterdata.article.read', 'masterdata', 'article', 'read', 'View article'),
(gen_random_uuid(), 'masterdata.article.list', 'masterdata', 'article', 'list', 'List articles'),
(gen_random_uuid(), 'masterdata.article.update', 'masterdata', 'article', 'update', 'Update article'),
(gen_random_uuid(), 'masterdata.article.delete', 'masterdata', 'article', 'delete', 'Delete article'),
(gen_random_uuid(), 'masterdata.article.export', 'masterdata', 'article', 'export', 'Export articles'),
(gen_random_uuid(), 'masterdata.article.import', 'masterdata', 'article', 'import', 'Import articles'),

(gen_random_uuid(), 'masterdata.model.create', 'masterdata', 'model', 'create', 'Create model'),
(gen_random_uuid(), 'masterdata.model.read', 'masterdata', 'model', 'read', 'View model'),
(gen_random_uuid(), 'masterdata.model.list', 'masterdata', 'model', 'list', 'List models'),
(gen_random_uuid(), 'masterdata.model.update', 'masterdata', 'model', 'update', 'Update model'),
(gen_random_uuid(), 'masterdata.model.delete', 'masterdata', 'model', 'delete', 'Delete model'),

(gen_random_uuid(), 'masterdata.size.create', 'masterdata', 'size', 'create', 'Create size'),
(gen_random_uuid(), 'masterdata.size.read', 'masterdata', 'size', 'read', 'View size'),
(gen_random_uuid(), 'masterdata.size.list', 'masterdata', 'size', 'list', 'List sizes'),
(gen_random_uuid(), 'masterdata.size.update', 'masterdata', 'size', 'update', 'Update size'),
(gen_random_uuid(), 'masterdata.size.delete', 'masterdata', 'size', 'delete', 'Delete size'),

(gen_random_uuid(), 'masterdata.barcode.create', 'masterdata', 'barcode', 'create', 'Create barcode'),
(gen_random_uuid(), 'masterdata.barcode.read', 'masterdata', 'barcode', 'read', 'View barcode'),
(gen_random_uuid(), 'masterdata.barcode.list', 'masterdata', 'barcode', 'list', 'List barcodes'),
(gen_random_uuid(), 'masterdata.barcode.update', 'masterdata', 'barcode', 'update', 'Update barcode'),
(gen_random_uuid(), 'masterdata.barcode.delete', 'masterdata', 'barcode', 'delete', 'Delete barcode'),

(gen_random_uuid(), 'masterdata.price.create', 'masterdata', 'price', 'create', 'Create price'),
(gen_random_uuid(), 'masterdata.price.read', 'masterdata', 'price', 'read', 'View price'),
(gen_random_uuid(), 'masterdata.price.list', 'masterdata', 'price', 'list', 'List prices'),
(gen_random_uuid(), 'masterdata.price.update', 'masterdata', 'price', 'update', 'Update price'),
(gen_random_uuid(), 'masterdata.price.delete', 'masterdata', 'price', 'delete', 'Delete price'),

(gen_random_uuid(), 'masterdata.supplier.create', 'masterdata', 'supplier', 'create', 'Create supplier'),
(gen_random_uuid(), 'masterdata.supplier.read', 'masterdata', 'supplier', 'read', 'View supplier'),
(gen_random_uuid(), 'masterdata.supplier.list', 'masterdata', 'supplier', 'list', 'List suppliers'),
(gen_random_uuid(), 'masterdata.supplier.update', 'masterdata', 'supplier', 'update', 'Update supplier'),
(gen_random_uuid(), 'masterdata.supplier.delete', 'masterdata', 'supplier', 'delete', 'Delete supplier'),

(gen_random_uuid(), 'masterdata.customer.create', 'masterdata', 'customer', 'create', 'Create customer'),
(gen_random_uuid(), 'masterdata.customer.read', 'masterdata', 'customer', 'read', 'View customer'),
(gen_random_uuid(), 'masterdata.customer.list', 'masterdata', 'customer', 'list', 'List customers'),
(gen_random_uuid(), 'masterdata.customer.update', 'masterdata', 'customer', 'update', 'Update customer'),
(gen_random_uuid(), 'masterdata.customer.delete', 'masterdata', 'customer', 'delete', 'Delete customer'),

(gen_random_uuid(), 'masterdata.warehouse.create', 'masterdata', 'warehouse', 'create', 'Create warehouse'),
(gen_random_uuid(), 'masterdata.warehouse.read', 'masterdata', 'warehouse', 'read', 'View warehouse'),
(gen_random_uuid(), 'masterdata.warehouse.list', 'masterdata', 'warehouse', 'list', 'List warehouses'),
(gen_random_uuid(), 'masterdata.warehouse.update', 'masterdata', 'warehouse', 'update', 'Update warehouse'),
(gen_random_uuid(), 'masterdata.warehouse.delete', 'masterdata', 'warehouse', 'delete', 'Delete warehouse'),

(gen_random_uuid(), 'masterdata.gallery-image.create', 'masterdata', 'gallery-image', 'create', 'Create gallery image'),
(gen_random_uuid(), 'masterdata.gallery-image.read', 'masterdata', 'gallery-image', 'read', 'View gallery image'),
(gen_random_uuid(), 'masterdata.gallery-image.list', 'masterdata', 'gallery-image', 'list', 'List gallery images'),
(gen_random_uuid(), 'masterdata.gallery-image.update', 'masterdata', 'gallery-image', 'update', 'Update gallery image'),
(gen_random_uuid(), 'masterdata.gallery-image.delete', 'masterdata', 'gallery-image', 'delete', 'Delete gallery image'),

(gen_random_uuid(), 'masterdata.courier-rate.create', 'masterdata', 'courier-rate', 'create', 'Create courier rate'),
(gen_random_uuid(), 'masterdata.courier-rate.read', 'masterdata', 'courier-rate', 'read', 'View courier rate'),
(gen_random_uuid(), 'masterdata.courier-rate.list', 'masterdata', 'courier-rate', 'list', 'List courier rates'),
(gen_random_uuid(), 'masterdata.courier-rate.update', 'masterdata', 'courier-rate', 'update', 'Update courier rate'),
(gen_random_uuid(), 'masterdata.courier-rate.delete', 'masterdata', 'courier-rate', 'delete', 'Delete courier rate'),

(gen_random_uuid(), 'masterdata.depstore.create', 'masterdata', 'depstore', 'create', 'Create department store'),
(gen_random_uuid(), 'masterdata.depstore.read', 'masterdata', 'depstore', 'read', 'View department store'),
(gen_random_uuid(), 'masterdata.depstore.list', 'masterdata', 'depstore', 'list', 'List department stores'),
(gen_random_uuid(), 'masterdata.depstore.update', 'masterdata', 'depstore', 'update', 'Update department store'),
(gen_random_uuid(), 'masterdata.depstore.delete', 'masterdata', 'depstore', 'delete', 'Delete department store'),

(gen_random_uuid(), 'masterdata.division.create', 'masterdata', 'division', 'create', 'Create division'),
(gen_random_uuid(), 'masterdata.division.read', 'masterdata', 'division', 'read', 'View division'),
(gen_random_uuid(), 'masterdata.division.list', 'masterdata', 'division', 'list', 'List divisions'),
(gen_random_uuid(), 'masterdata.division.update', 'masterdata', 'division', 'update', 'Update division'),
(gen_random_uuid(), 'masterdata.division.delete', 'masterdata', 'division', 'delete', 'Delete division'),

-- ===================== ACCOUNTING MODULE =====================
(gen_random_uuid(), 'accounting.chart-of-account.create', 'accounting', 'chart-of-account', 'create', 'Create chart of account'),
(gen_random_uuid(), 'accounting.chart-of-account.read', 'accounting', 'chart-of-account', 'read', 'View chart of account'),
(gen_random_uuid(), 'accounting.chart-of-account.list', 'accounting', 'chart-of-account', 'list', 'List chart of accounts'),
(gen_random_uuid(), 'accounting.chart-of-account.update', 'accounting', 'chart-of-account', 'update', 'Update chart of account'),
(gen_random_uuid(), 'accounting.chart-of-account.delete', 'accounting', 'chart-of-account', 'delete', 'Delete chart of account'),

(gen_random_uuid(), 'accounting.general-ledger.read', 'accounting', 'general-ledger', 'read', 'View general ledger entry'),
(gen_random_uuid(), 'accounting.general-ledger.list', 'accounting', 'general-ledger', 'list', 'List general ledger entries'),

(gen_random_uuid(), 'accounting.journal-entry.create', 'accounting', 'journal-entry', 'create', 'Create journal entry'),
(gen_random_uuid(), 'accounting.journal-entry.read', 'accounting', 'journal-entry', 'read', 'View journal entry'),
(gen_random_uuid(), 'accounting.journal-entry.list', 'accounting', 'journal-entry', 'list', 'List journal entries'),
(gen_random_uuid(), 'accounting.journal-entry.update', 'accounting', 'journal-entry', 'update', 'Update journal entry'),
(gen_random_uuid(), 'accounting.journal-entry.delete', 'accounting', 'journal-entry', 'delete', 'Delete journal entry'),

(gen_random_uuid(), 'accounting.trial-balance.read', 'accounting', 'trial-balance', 'read', 'View trial balance'),
(gen_random_uuid(), 'accounting.trial-balance.export', 'accounting', 'trial-balance', 'export', 'Export trial balance'),

(gen_random_uuid(), 'accounting.auto-journal.create', 'accounting', 'auto-journal', 'create', 'Create auto journal'),
(gen_random_uuid(), 'accounting.auto-journal.read', 'accounting', 'auto-journal', 'read', 'View auto journal config'),
(gen_random_uuid(), 'accounting.auto-journal.list', 'accounting', 'auto-journal', 'list', 'List auto journal configs'),
(gen_random_uuid(), 'accounting.auto-journal.update', 'accounting', 'auto-journal', 'update', 'Update auto journal config'),

(gen_random_uuid(), 'accounting.cost-center.create', 'accounting', 'cost-center', 'create', 'Create cost center'),
(gen_random_uuid(), 'accounting.cost-center.read', 'accounting', 'cost-center', 'read', 'View cost center'),
(gen_random_uuid(), 'accounting.cost-center.list', 'accounting', 'cost-center', 'list', 'List cost centers'),
(gen_random_uuid(), 'accounting.cost-center.update', 'accounting', 'cost-center', 'update', 'Update cost center'),
(gen_random_uuid(), 'accounting.cost-center.delete', 'accounting', 'cost-center', 'delete', 'Delete cost center'),

(gen_random_uuid(), 'accounting.exchange-rate.read', 'accounting', 'exchange-rate', 'read', 'View exchange rates'),
(gen_random_uuid(), 'accounting.exchange-rate.list', 'accounting', 'exchange-rate', 'list', 'List exchange rates'),
(gen_random_uuid(), 'accounting.exchange-rate.update', 'accounting', 'exchange-rate', 'update', 'Refresh exchange rates'),

(gen_random_uuid(), 'accounting.budget.create', 'accounting', 'budget', 'create', 'Create budget'),
(gen_random_uuid(), 'accounting.budget.read', 'accounting', 'budget', 'read', 'View budget'),
(gen_random_uuid(), 'accounting.budget.list', 'accounting', 'budget', 'list', 'List budgets'),
(gen_random_uuid(), 'accounting.budget.update', 'accounting', 'budget', 'update', 'Update budget'),
(gen_random_uuid(), 'accounting.budget.delete', 'accounting', 'budget', 'delete', 'Delete budget'),
(gen_random_uuid(), 'accounting.budget.approve', 'accounting', 'budget', 'approve', 'Approve budget'),

(gen_random_uuid(), 'accounting.financial-period.create', 'accounting', 'financial-period', 'create', 'Create financial period'),
(gen_random_uuid(), 'accounting.financial-period.read', 'accounting', 'financial-period', 'read', 'View financial period'),
(gen_random_uuid(), 'accounting.financial-period.list', 'accounting', 'financial-period', 'list', 'List financial periods'),
(gen_random_uuid(), 'accounting.financial-period.update', 'accounting', 'financial-period', 'update', 'Update financial period'),
(gen_random_uuid(), 'accounting.financial-period.delete', 'accounting', 'financial-period', 'delete', 'Delete financial period'),
(gen_random_uuid(), 'accounting.financial-period.close', 'accounting', 'financial-period', 'close', 'Close financial period'),

(gen_random_uuid(), 'accounting.fixed-asset.create', 'accounting', 'fixed-asset', 'create', 'Create fixed asset'),
(gen_random_uuid(), 'accounting.fixed-asset.read', 'accounting', 'fixed-asset', 'read', 'View fixed asset'),
(gen_random_uuid(), 'accounting.fixed-asset.list', 'accounting', 'fixed-asset', 'list', 'List fixed assets'),
(gen_random_uuid(), 'accounting.fixed-asset.update', 'accounting', 'fixed-asset', 'update', 'Update fixed asset'),
(gen_random_uuid(), 'accounting.fixed-asset.delete', 'accounting', 'fixed-asset', 'delete', 'Delete fixed asset'),

-- ===================== INVENTORY MODULE =====================
(gen_random_uuid(), 'inventory.purchase-order.create', 'inventory', 'purchase-order', 'create', 'Create purchase order'),
(gen_random_uuid(), 'inventory.purchase-order.read', 'inventory', 'purchase-order', 'read', 'View purchase order'),
(gen_random_uuid(), 'inventory.purchase-order.list', 'inventory', 'purchase-order', 'list', 'List purchase orders'),
(gen_random_uuid(), 'inventory.purchase-order.update', 'inventory', 'purchase-order', 'update', 'Update purchase order'),
(gen_random_uuid(), 'inventory.purchase-order.delete', 'inventory', 'purchase-order', 'delete', 'Delete purchase order'),

(gen_random_uuid(), 'inventory.goods-receipt.create', 'inventory', 'goods-receipt', 'create', 'Create goods receipt'),
(gen_random_uuid(), 'inventory.goods-receipt.read', 'inventory', 'goods-receipt', 'read', 'View goods receipt'),
(gen_random_uuid(), 'inventory.goods-receipt.list', 'inventory', 'goods-receipt', 'list', 'List goods receipts'),
(gen_random_uuid(), 'inventory.goods-receipt.update', 'inventory', 'goods-receipt', 'update', 'Update goods receipt'),
(gen_random_uuid(), 'inventory.goods-receipt.delete', 'inventory', 'goods-receipt', 'delete', 'Delete goods receipt'),
(gen_random_uuid(), 'inventory.goods-receipt.post', 'inventory', 'goods-receipt', 'post', 'Post goods receipt'),

(gen_random_uuid(), 'inventory.stock.create', 'inventory', 'stock', 'create', 'Record stock movement'),
(gen_random_uuid(), 'inventory.stock.read', 'inventory', 'stock', 'read', 'View stock balance'),
(gen_random_uuid(), 'inventory.stock.list', 'inventory', 'stock', 'list', 'List stock movements'),

(gen_random_uuid(), 'inventory.transfer.create', 'inventory', 'transfer', 'create', 'Create transfer order'),
(gen_random_uuid(), 'inventory.transfer.read', 'inventory', 'transfer', 'read', 'View transfer order'),
(gen_random_uuid(), 'inventory.transfer.list', 'inventory', 'transfer', 'list', 'List transfer orders'),
(gen_random_uuid(), 'inventory.transfer.update', 'inventory', 'transfer', 'update', 'Update transfer order'),
(gen_random_uuid(), 'inventory.transfer.delete', 'inventory', 'transfer', 'delete', 'Delete transfer order'),

(gen_random_uuid(), 'inventory.draft-order.create', 'inventory', 'draft-order', 'create', 'Create draft order'),
(gen_random_uuid(), 'inventory.draft-order.read', 'inventory', 'draft-order', 'read', 'View draft order'),
(gen_random_uuid(), 'inventory.draft-order.list', 'inventory', 'draft-order', 'list', 'List draft orders'),
(gen_random_uuid(), 'inventory.draft-order.update', 'inventory', 'draft-order', 'update', 'Update draft order'),
(gen_random_uuid(), 'inventory.draft-order.delete', 'inventory', 'draft-order', 'delete', 'Delete draft order'),

(gen_random_uuid(), 'inventory.adjustment.create', 'inventory', 'adjustment', 'create', 'Create stock adjustment'),
(gen_random_uuid(), 'inventory.adjustment.read', 'inventory', 'adjustment', 'read', 'View stock adjustment'),
(gen_random_uuid(), 'inventory.adjustment.list', 'inventory', 'adjustment', 'list', 'List stock adjustments'),
(gen_random_uuid(), 'inventory.adjustment.update', 'inventory', 'adjustment', 'update', 'Update stock adjustment'),
(gen_random_uuid(), 'inventory.adjustment.delete', 'inventory', 'adjustment', 'delete', 'Delete stock adjustment'),

(gen_random_uuid(), 'inventory.opname.create', 'inventory', 'opname', 'create', 'Create stock opname'),
(gen_random_uuid(), 'inventory.opname.read', 'inventory', 'opname', 'read', 'View stock opname'),
(gen_random_uuid(), 'inventory.opname.list', 'inventory', 'opname', 'list', 'List stock opnames'),
(gen_random_uuid(), 'inventory.opname.update', 'inventory', 'opname', 'update', 'Update stock opname'),
(gen_random_uuid(), 'inventory.opname.delete', 'inventory', 'opname', 'delete', 'Delete stock opname'),

(gen_random_uuid(), 'inventory.return-supplier.create', 'inventory', 'return-supplier', 'create', 'Create return to supplier'),
(gen_random_uuid(), 'inventory.return-supplier.read', 'inventory', 'return-supplier', 'read', 'View return to supplier'),
(gen_random_uuid(), 'inventory.return-supplier.list', 'inventory', 'return-supplier', 'list', 'List returns to supplier'),
(gen_random_uuid(), 'inventory.return-supplier.update', 'inventory', 'return-supplier', 'update', 'Update return to supplier'),
(gen_random_uuid(), 'inventory.return-supplier.delete', 'inventory', 'return-supplier', 'delete', 'Delete return to supplier'),

(gen_random_uuid(), 'inventory.goods-issue.create', 'inventory', 'goods-issue', 'create', 'Create goods issue'),
(gen_random_uuid(), 'inventory.goods-issue.read', 'inventory', 'goods-issue', 'read', 'View goods issue'),
(gen_random_uuid(), 'inventory.goods-issue.list', 'inventory', 'goods-issue', 'list', 'List goods issues'),
(gen_random_uuid(), 'inventory.goods-issue.update', 'inventory', 'goods-issue', 'update', 'Update goods issue'),
(gen_random_uuid(), 'inventory.goods-issue.delete', 'inventory', 'goods-issue', 'delete', 'Delete goods issue'),

(gen_random_uuid(), 'inventory.rfq.create', 'inventory', 'rfq', 'create', 'Create RFQ'),
(gen_random_uuid(), 'inventory.rfq.read', 'inventory', 'rfq', 'read', 'View RFQ'),
(gen_random_uuid(), 'inventory.rfq.list', 'inventory', 'rfq', 'list', 'List RFQs'),
(gen_random_uuid(), 'inventory.rfq.update', 'inventory', 'rfq', 'update', 'Update RFQ'),
(gen_random_uuid(), 'inventory.rfq.delete', 'inventory', 'rfq', 'delete', 'Delete RFQ'),
(gen_random_uuid(), 'inventory.rfq.publish', 'inventory', 'rfq', 'publish', 'Publish RFQ'),
(gen_random_uuid(), 'inventory.rfq.close', 'inventory', 'rfq', 'close', 'Close RFQ'),

-- ===================== SALES MODULE =====================
(gen_random_uuid(), 'sales.order.create', 'sales', 'order', 'create', 'Create sales order'),
(gen_random_uuid(), 'sales.order.read', 'sales', 'order', 'read', 'View sales order'),
(gen_random_uuid(), 'sales.order.list', 'sales', 'order', 'list', 'List sales orders'),
(gen_random_uuid(), 'sales.order.update', 'sales', 'order', 'update', 'Update sales order'),
(gen_random_uuid(), 'sales.order.delete', 'sales', 'order', 'delete', 'Delete sales order'),

(gen_random_uuid(), 'sales.invoice.create', 'sales', 'invoice', 'create', 'Create sales invoice'),
(gen_random_uuid(), 'sales.invoice.read', 'sales', 'invoice', 'read', 'View sales invoice'),
(gen_random_uuid(), 'sales.invoice.list', 'sales', 'invoice', 'list', 'List sales invoices'),
(gen_random_uuid(), 'sales.invoice.update', 'sales', 'invoice', 'update', 'Update sales invoice'),
(gen_random_uuid(), 'sales.invoice.delete', 'sales', 'invoice', 'delete', 'Delete sales invoice'),

(gen_random_uuid(), 'sales.pos-transaction.create', 'sales', 'pos-transaction', 'create', 'Create POS transaction'),
(gen_random_uuid(), 'sales.pos-transaction.read', 'sales', 'pos-transaction', 'read', 'View POS transaction'),
(gen_random_uuid(), 'sales.pos-transaction.list', 'sales', 'pos-transaction', 'list', 'List POS transactions'),
(gen_random_uuid(), 'sales.pos-transaction.update', 'sales', 'pos-transaction', 'update', 'Update POS transaction'),
(gen_random_uuid(), 'sales.pos-transaction.delete', 'sales', 'pos-transaction', 'delete', 'Delete POS transaction'),

(gen_random_uuid(), 'sales.online-order.create', 'sales', 'online-order', 'create', 'Create online order'),
(gen_random_uuid(), 'sales.online-order.read', 'sales', 'online-order', 'read', 'View online order'),
(gen_random_uuid(), 'sales.online-order.list', 'sales', 'online-order', 'list', 'List online orders'),
(gen_random_uuid(), 'sales.online-order.update', 'sales', 'online-order', 'update', 'Update online order'),
(gen_random_uuid(), 'sales.online-order.delete', 'sales', 'online-order', 'delete', 'Delete online order'),

(gen_random_uuid(), 'sales.consignment.create', 'sales', 'consignment', 'create', 'Create consignment sale'),
(gen_random_uuid(), 'sales.consignment.read', 'sales', 'consignment', 'read', 'View consignment sale'),
(gen_random_uuid(), 'sales.consignment.list', 'sales', 'consignment', 'list', 'List consignment sales'),
(gen_random_uuid(), 'sales.consignment.update', 'sales', 'consignment', 'update', 'Update consignment sale'),
(gen_random_uuid(), 'sales.consignment.delete', 'sales', 'consignment', 'delete', 'Delete consignment sale'),

(gen_random_uuid(), 'sales.return.create', 'sales', 'return', 'create', 'Create sales return'),
(gen_random_uuid(), 'sales.return.read', 'sales', 'return', 'read', 'View sales return'),
(gen_random_uuid(), 'sales.return.list', 'sales', 'return', 'list', 'List sales returns'),
(gen_random_uuid(), 'sales.return.update', 'sales', 'return', 'update', 'Update sales return'),
(gen_random_uuid(), 'sales.return.delete', 'sales', 'return', 'delete', 'Delete sales return'),

(gen_random_uuid(), 'sales.promotion.create', 'sales', 'promotion', 'create', 'Create promotion'),
(gen_random_uuid(), 'sales.promotion.read', 'sales', 'promotion', 'read', 'View promotion'),
(gen_random_uuid(), 'sales.promotion.list', 'sales', 'promotion', 'list', 'List promotions'),
(gen_random_uuid(), 'sales.promotion.update', 'sales', 'promotion', 'update', 'Update promotion'),
(gen_random_uuid(), 'sales.promotion.delete', 'sales', 'promotion', 'delete', 'Delete promotion'),

(gen_random_uuid(), 'sales.target.create', 'sales', 'target', 'create', 'Create sales target'),
(gen_random_uuid(), 'sales.target.read', 'sales', 'target', 'read', 'View sales target'),
(gen_random_uuid(), 'sales.target.list', 'sales', 'target', 'list', 'List sales targets'),
(gen_random_uuid(), 'sales.target.update', 'sales', 'target', 'update', 'Update sales target'),
(gen_random_uuid(), 'sales.target.delete', 'sales', 'target', 'delete', 'Delete sales target'),

(gen_random_uuid(), 'sales.kompetitor.create', 'sales', 'kompetitor', 'create', 'Create kompetitor entry'),
(gen_random_uuid(), 'sales.kompetitor.read', 'sales', 'kompetitor', 'read', 'View kompetitor entry'),
(gen_random_uuid(), 'sales.kompetitor.list', 'sales', 'kompetitor', 'list', 'List kompetitor entries'),
(gen_random_uuid(), 'sales.kompetitor.update', 'sales', 'kompetitor', 'update', 'Update kompetitor entry'),
(gen_random_uuid(), 'sales.kompetitor.delete', 'sales', 'kompetitor', 'delete', 'Delete kompetitor entry'),

(gen_random_uuid(), 'sales.proses-margin.create', 'sales', 'proses-margin', 'create', 'Create proses margin'),
(gen_random_uuid(), 'sales.proses-margin.read', 'sales', 'proses-margin', 'read', 'View proses margin'),
(gen_random_uuid(), 'sales.proses-margin.list', 'sales', 'proses-margin', 'list', 'List proses margins'),
(gen_random_uuid(), 'sales.proses-margin.update', 'sales', 'proses-margin', 'update', 'Update proses margin'),
(gen_random_uuid(), 'sales.proses-margin.delete', 'sales', 'proses-margin', 'delete', 'Delete proses margin'),

(gen_random_uuid(), 'sales.rekonsiliasi.create', 'sales', 'rekonsiliasi', 'create', 'Create rekonsiliasi'),
(gen_random_uuid(), 'sales.rekonsiliasi.read', 'sales', 'rekonsiliasi', 'read', 'View rekonsiliasi'),
(gen_random_uuid(), 'sales.rekonsiliasi.list', 'sales', 'rekonsiliasi', 'list', 'List rekonsiliasi'),
(gen_random_uuid(), 'sales.rekonsiliasi.update', 'sales', 'rekonsiliasi', 'update', 'Update rekonsiliasi'),
(gen_random_uuid(), 'sales.rekonsiliasi.delete', 'sales', 'rekonsiliasi', 'delete', 'Delete rekonsiliasi'),

-- ===================== SHIPPING MODULE =====================
(gen_random_uuid(), 'shipping.courier.create', 'shipping', 'courier', 'create', 'Create courier'),
(gen_random_uuid(), 'shipping.courier.read', 'shipping', 'courier', 'read', 'View courier'),
(gen_random_uuid(), 'shipping.courier.list', 'shipping', 'courier', 'list', 'List couriers'),
(gen_random_uuid(), 'shipping.courier.update', 'shipping', 'courier', 'update', 'Update courier'),
(gen_random_uuid(), 'shipping.courier.delete', 'shipping', 'courier', 'delete', 'Delete courier'),

(gen_random_uuid(), 'shipping.shipment.create', 'shipping', 'shipment', 'create', 'Create shipment'),
(gen_random_uuid(), 'shipping.shipment.read', 'shipping', 'shipment', 'read', 'View shipment'),
(gen_random_uuid(), 'shipping.shipment.list', 'shipping', 'shipment', 'list', 'List shipments'),
(gen_random_uuid(), 'shipping.shipment.update', 'shipping', 'shipment', 'update', 'Update shipment'),
(gen_random_uuid(), 'shipping.shipment.delete', 'shipping', 'shipment', 'delete', 'Delete shipment'),

(gen_random_uuid(), 'shipping.airwaybill.create', 'shipping', 'airwaybill', 'create', 'Create airwaybill'),
(gen_random_uuid(), 'shipping.airwaybill.read', 'shipping', 'airwaybill', 'read', 'View airwaybill'),
(gen_random_uuid(), 'shipping.airwaybill.list', 'shipping', 'airwaybill', 'list', 'List airwaybills'),
(gen_random_uuid(), 'shipping.airwaybill.update', 'shipping', 'airwaybill', 'update', 'Update airwaybill'),
(gen_random_uuid(), 'shipping.airwaybill.delete', 'shipping', 'airwaybill', 'delete', 'Delete airwaybill'),

(gen_random_uuid(), 'shipping.manifest.create', 'shipping', 'manifest', 'create', 'Create manifest'),
(gen_random_uuid(), 'shipping.manifest.read', 'shipping', 'manifest', 'read', 'View manifest'),
(gen_random_uuid(), 'shipping.manifest.list', 'shipping', 'manifest', 'list', 'List manifests'),
(gen_random_uuid(), 'shipping.manifest.update', 'shipping', 'manifest', 'update', 'Update manifest'),
(gen_random_uuid(), 'shipping.manifest.delete', 'shipping', 'manifest', 'delete', 'Delete manifest'),

(gen_random_uuid(), 'shipping.invoice.create', 'shipping', 'invoice', 'create', 'Create shipping invoice'),
(gen_random_uuid(), 'shipping.invoice.read', 'shipping', 'invoice', 'read', 'View shipping invoice'),
(gen_random_uuid(), 'shipping.invoice.list', 'shipping', 'invoice', 'list', 'List shipping invoices'),
(gen_random_uuid(), 'shipping.invoice.update', 'shipping', 'invoice', 'update', 'Update shipping invoice'),
(gen_random_uuid(), 'shipping.invoice.delete', 'shipping', 'invoice', 'delete', 'Delete shipping invoice'),
(gen_random_uuid(), 'shipping.invoice.pay', 'shipping', 'invoice', 'pay', 'Pay shipping invoice'),

-- ===================== FINANCE MODULE =====================
(gen_random_uuid(), 'finance.cash-bank.create', 'finance', 'cash-bank', 'create', 'Create cash/bank account'),
(gen_random_uuid(), 'finance.cash-bank.read', 'finance', 'cash-bank', 'read', 'View cash/bank account'),
(gen_random_uuid(), 'finance.cash-bank.list', 'finance', 'cash-bank', 'list', 'List cash/bank accounts'),
(gen_random_uuid(), 'finance.cash-bank.update', 'finance', 'cash-bank', 'update', 'Update cash/bank account'),
(gen_random_uuid(), 'finance.cash-bank.delete', 'finance', 'cash-bank', 'delete', 'Delete cash/bank account'),

(gen_random_uuid(), 'finance.payment.create', 'finance', 'payment', 'create', 'Create payment'),
(gen_random_uuid(), 'finance.payment.read', 'finance', 'payment', 'read', 'View payment'),
(gen_random_uuid(), 'finance.payment.list', 'finance', 'payment', 'list', 'List payments'),
(gen_random_uuid(), 'finance.payment.update', 'finance', 'payment', 'update', 'Update payment'),
(gen_random_uuid(), 'finance.payment.delete', 'finance', 'payment', 'delete', 'Delete payment'),

(gen_random_uuid(), 'finance.invoice.create', 'finance', 'invoice', 'create', 'Create finance invoice'),
(gen_random_uuid(), 'finance.invoice.read', 'finance', 'invoice', 'read', 'View finance invoice'),
(gen_random_uuid(), 'finance.invoice.list', 'finance', 'invoice', 'list', 'List finance invoices'),
(gen_random_uuid(), 'finance.invoice.update', 'finance', 'invoice', 'update', 'Update finance invoice'),
(gen_random_uuid(), 'finance.invoice.delete', 'finance', 'invoice', 'delete', 'Delete finance invoice'),

(gen_random_uuid(), 'finance.accounts-payable.create', 'finance', 'accounts-payable', 'create', 'Create accounts payable'),
(gen_random_uuid(), 'finance.accounts-payable.read', 'finance', 'accounts-payable', 'read', 'View accounts payable'),
(gen_random_uuid(), 'finance.accounts-payable.list', 'finance', 'accounts-payable', 'list', 'List accounts payable'),
(gen_random_uuid(), 'finance.accounts-payable.update', 'finance', 'accounts-payable', 'update', 'Update accounts payable'),
(gen_random_uuid(), 'finance.accounts-payable.delete', 'finance', 'accounts-payable', 'delete', 'Delete accounts payable'),

(gen_random_uuid(), 'finance.accounts-receivable.create', 'finance', 'accounts-receivable', 'create', 'Create accounts receivable'),
(gen_random_uuid(), 'finance.accounts-receivable.read', 'finance', 'accounts-receivable', 'read', 'View accounts receivable'),
(gen_random_uuid(), 'finance.accounts-receivable.list', 'finance', 'accounts-receivable', 'list', 'List accounts receivable'),
(gen_random_uuid(), 'finance.accounts-receivable.update', 'finance', 'accounts-receivable', 'update', 'Update accounts receivable'),
(gen_random_uuid(), 'finance.accounts-receivable.delete', 'finance', 'accounts-receivable', 'delete', 'Delete accounts receivable'),

(gen_random_uuid(), 'finance.cash-disbursement.create', 'finance', 'cash-disbursement', 'create', 'Create cash disbursement'),
(gen_random_uuid(), 'finance.cash-disbursement.read', 'finance', 'cash-disbursement', 'read', 'View cash disbursement'),
(gen_random_uuid(), 'finance.cash-disbursement.list', 'finance', 'cash-disbursement', 'list', 'List cash disbursements'),
(gen_random_uuid(), 'finance.cash-disbursement.update', 'finance', 'cash-disbursement', 'update', 'Update cash disbursement'),
(gen_random_uuid(), 'finance.cash-disbursement.delete', 'finance', 'cash-disbursement', 'delete', 'Delete cash disbursement'),

(gen_random_uuid(), 'finance.cash-receipt.create', 'finance', 'cash-receipt', 'create', 'Create cash receipt'),
(gen_random_uuid(), 'finance.cash-receipt.read', 'finance', 'cash-receipt', 'read', 'View cash receipt'),
(gen_random_uuid(), 'finance.cash-receipt.list', 'finance', 'cash-receipt', 'list', 'List cash receipts'),
(gen_random_uuid(), 'finance.cash-receipt.update', 'finance', 'cash-receipt', 'update', 'Update cash receipt'),
(gen_random_uuid(), 'finance.cash-receipt.delete', 'finance', 'cash-receipt', 'delete', 'Delete cash receipt'),

(gen_random_uuid(), 'finance.bank-transfer.create', 'finance', 'bank-transfer', 'create', 'Create bank transfer'),
(gen_random_uuid(), 'finance.bank-transfer.read', 'finance', 'bank-transfer', 'read', 'View bank transfer'),
(gen_random_uuid(), 'finance.bank-transfer.list', 'finance', 'bank-transfer', 'list', 'List bank transfers'),
(gen_random_uuid(), 'finance.bank-transfer.update', 'finance', 'bank-transfer', 'update', 'Update bank transfer'),
(gen_random_uuid(), 'finance.bank-transfer.delete', 'finance', 'bank-transfer', 'delete', 'Delete bank transfer'),

(gen_random_uuid(), 'finance.cash-opening-balance.create', 'finance', 'cash-opening-balance', 'create', 'Create cash opening balance'),
(gen_random_uuid(), 'finance.cash-opening-balance.read', 'finance', 'cash-opening-balance', 'read', 'View cash opening balance'),
(gen_random_uuid(), 'finance.cash-opening-balance.list', 'finance', 'cash-opening-balance', 'list', 'List cash opening balances'),
(gen_random_uuid(), 'finance.cash-opening-balance.update', 'finance', 'cash-opening-balance', 'update', 'Update cash opening balance'),
(gen_random_uuid(), 'finance.cash-opening-balance.delete', 'finance', 'cash-opening-balance', 'delete', 'Delete cash opening balance'),

(gen_random_uuid(), 'finance.purchase-voucher.create', 'finance', 'purchase-voucher', 'create', 'Create purchase voucher'),
(gen_random_uuid(), 'finance.purchase-voucher.read', 'finance', 'purchase-voucher', 'read', 'View purchase voucher'),
(gen_random_uuid(), 'finance.purchase-voucher.list', 'finance', 'purchase-voucher', 'list', 'List purchase vouchers'),
(gen_random_uuid(), 'finance.purchase-voucher.update', 'finance', 'purchase-voucher', 'update', 'Update purchase voucher'),
(gen_random_uuid(), 'finance.purchase-voucher.delete', 'finance', 'purchase-voucher', 'delete', 'Delete purchase voucher'),
(gen_random_uuid(), 'finance.purchase-voucher.approve', 'finance', 'purchase-voucher', 'approve', 'Approve purchase voucher'),

(gen_random_uuid(), 'finance.expenditure-request.create', 'finance', 'expenditure-request', 'create', 'Create expenditure request'),
(gen_random_uuid(), 'finance.expenditure-request.read', 'finance', 'expenditure-request', 'read', 'View expenditure request'),
(gen_random_uuid(), 'finance.expenditure-request.list', 'finance', 'expenditure-request', 'list', 'List expenditure requests'),
(gen_random_uuid(), 'finance.expenditure-request.update', 'finance', 'expenditure-request', 'update', 'Update expenditure request'),
(gen_random_uuid(), 'finance.expenditure-request.delete', 'finance', 'expenditure-request', 'delete', 'Delete expenditure request'),
(gen_random_uuid(), 'finance.expenditure-request.approve', 'finance', 'expenditure-request', 'approve', 'Approve expenditure request'),
(gen_random_uuid(), 'finance.expenditure-request.reject', 'finance', 'expenditure-request', 'reject', 'Reject expenditure request'),
(gen_random_uuid(), 'finance.expenditure-request.disburse', 'finance', 'expenditure-request', 'disburse', 'Disburse expenditure request'),

(gen_random_uuid(), 'finance.check-clearance.create', 'finance', 'check-clearance', 'create', 'Create check clearance'),
(gen_random_uuid(), 'finance.check-clearance.read', 'finance', 'check-clearance', 'read', 'View check clearance'),
(gen_random_uuid(), 'finance.check-clearance.list', 'finance', 'check-clearance', 'list', 'List check clearances'),
(gen_random_uuid(), 'finance.check-clearance.update', 'finance', 'check-clearance', 'update', 'Update check clearance'),
(gen_random_uuid(), 'finance.check-clearance.delete', 'finance', 'check-clearance', 'delete', 'Delete check clearance'),
(gen_random_uuid(), 'finance.check-clearance.clear', 'finance', 'check-clearance', 'clear', 'Clear check'),
(gen_random_uuid(), 'finance.check-clearance.bounce', 'finance', 'check-clearance', 'bounce', 'Bounce check'),

(gen_random_uuid(), 'finance.monthly-closing.create', 'finance', 'monthly-closing', 'create', 'Create monthly closing'),
(gen_random_uuid(), 'finance.monthly-closing.read', 'finance', 'monthly-closing', 'read', 'View monthly closing'),
(gen_random_uuid(), 'finance.monthly-closing.list', 'finance', 'monthly-closing', 'list', 'List monthly closings'),
(gen_random_uuid(), 'finance.monthly-closing.update', 'finance', 'monthly-closing', 'update', 'Update monthly closing'),
(gen_random_uuid(), 'finance.monthly-closing.delete', 'finance', 'monthly-closing', 'delete', 'Delete monthly closing'),
(gen_random_uuid(), 'finance.monthly-closing.close', 'finance', 'monthly-closing', 'close', 'Close month'),
(gen_random_uuid(), 'finance.monthly-closing.lock', 'finance', 'monthly-closing', 'lock', 'Lock monthly closing'),
(gen_random_uuid(), 'finance.monthly-closing.unlock', 'finance', 'monthly-closing', 'unlock', 'Unlock monthly closing'),

(gen_random_uuid(), 'finance.cash-book.create', 'finance', 'cash-book', 'create', 'Create cash book entry'),
(gen_random_uuid(), 'finance.cash-book.read', 'finance', 'cash-book', 'read', 'View cash book entry'),
(gen_random_uuid(), 'finance.cash-book.list', 'finance', 'cash-book', 'list', 'List cash book entries'),
(gen_random_uuid(), 'finance.cash-book.update', 'finance', 'cash-book', 'update', 'Update cash book entry'),
(gen_random_uuid(), 'finance.cash-book.delete', 'finance', 'cash-book', 'delete', 'Delete cash book entry'),

-- ===================== HR MODULE =====================
(gen_random_uuid(), 'hr.employee.create', 'hr', 'employee', 'create', 'Create employee'),
(gen_random_uuid(), 'hr.employee.read', 'hr', 'employee', 'read', 'View employee'),
(gen_random_uuid(), 'hr.employee.list', 'hr', 'employee', 'list', 'List employees'),
(gen_random_uuid(), 'hr.employee.update', 'hr', 'employee', 'update', 'Update employee'),
(gen_random_uuid(), 'hr.employee.delete', 'hr', 'employee', 'delete', 'Delete employee'),

(gen_random_uuid(), 'hr.payroll.create', 'hr', 'payroll', 'create', 'Create payroll period'),
(gen_random_uuid(), 'hr.payroll.read', 'hr', 'payroll', 'read', 'View payroll'),
(gen_random_uuid(), 'hr.payroll.list', 'hr', 'payroll', 'list', 'List payroll periods'),
(gen_random_uuid(), 'hr.payroll.update', 'hr', 'payroll', 'update', 'Update payroll period'),
(gen_random_uuid(), 'hr.payroll.delete', 'hr', 'payroll', 'delete', 'Delete payroll period'),
(gen_random_uuid(), 'hr.payroll.process', 'hr', 'payroll', 'process', 'Process payroll'),
(gen_random_uuid(), 'hr.payroll.approve', 'hr', 'payroll', 'approve', 'Approve payroll'),

(gen_random_uuid(), 'hr.leave.create', 'hr', 'leave', 'create', 'Create leave request'),
(gen_random_uuid(), 'hr.leave.read', 'hr', 'leave', 'read', 'View leave request'),
(gen_random_uuid(), 'hr.leave.list', 'hr', 'leave', 'list', 'List leave requests'),
(gen_random_uuid(), 'hr.leave.update', 'hr', 'leave', 'update', 'Update leave request'),
(gen_random_uuid(), 'hr.leave.delete', 'hr', 'leave', 'delete', 'Delete leave request'),
(gen_random_uuid(), 'hr.leave.approve', 'hr', 'leave', 'approve', 'Approve leave request'),
(gen_random_uuid(), 'hr.leave.reject', 'hr', 'leave', 'reject', 'Reject leave request'),
(gen_random_uuid(), 'hr.leave.cancel', 'hr', 'leave', 'cancel', 'Cancel leave request'),

(gen_random_uuid(), 'hr.performance.create', 'hr', 'performance', 'create', 'Create performance review'),
(gen_random_uuid(), 'hr.performance.read', 'hr', 'performance', 'read', 'View performance review'),
(gen_random_uuid(), 'hr.performance.list', 'hr', 'performance', 'list', 'List performance reviews'),
(gen_random_uuid(), 'hr.performance.update', 'hr', 'performance', 'update', 'Update performance review'),
(gen_random_uuid(), 'hr.performance.delete', 'hr', 'performance', 'delete', 'Delete performance review'),

(gen_random_uuid(), 'hr.training.create', 'hr', 'training', 'create', 'Create training program'),
(gen_random_uuid(), 'hr.training.read', 'hr', 'training', 'read', 'View training program'),
(gen_random_uuid(), 'hr.training.list', 'hr', 'training', 'list', 'List training programs'),
(gen_random_uuid(), 'hr.training.update', 'hr', 'training', 'update', 'Update training program'),
(gen_random_uuid(), 'hr.training.delete', 'hr', 'training', 'delete', 'Delete training program'),

-- ===================== PROCUREMENT MODULE =====================
(gen_random_uuid(), 'procurement.purchase-request.create', 'procurement', 'purchase-request', 'create', 'Create purchase request'),
(gen_random_uuid(), 'procurement.purchase-request.read', 'procurement', 'purchase-request', 'read', 'View purchase request'),
(gen_random_uuid(), 'procurement.purchase-request.list', 'procurement', 'purchase-request', 'list', 'List purchase requests'),
(gen_random_uuid(), 'procurement.purchase-request.update', 'procurement', 'purchase-request', 'update', 'Update purchase request'),
(gen_random_uuid(), 'procurement.purchase-request.delete', 'procurement', 'purchase-request', 'delete', 'Delete purchase request'),
(gen_random_uuid(), 'procurement.purchase-request.submit', 'procurement', 'purchase-request', 'submit', 'Submit purchase request'),
(gen_random_uuid(), 'procurement.purchase-request.approve', 'procurement', 'purchase-request', 'approve', 'Approve purchase request'),
(gen_random_uuid(), 'procurement.purchase-request.reject', 'procurement', 'purchase-request', 'reject', 'Reject purchase request'),
(gen_random_uuid(), 'procurement.purchase-request.cancel', 'procurement', 'purchase-request', 'cancel', 'Cancel purchase request'),
(gen_random_uuid(), 'procurement.purchase-request.convert', 'procurement', 'purchase-request', 'convert', 'Convert PR to PO'),

(gen_random_uuid(), 'procurement.purchase-order.create', 'procurement', 'purchase-order', 'create', 'Create procurement PO'),
(gen_random_uuid(), 'procurement.purchase-order.read', 'procurement', 'purchase-order', 'read', 'View procurement PO'),
(gen_random_uuid(), 'procurement.purchase-order.list', 'procurement', 'purchase-order', 'list', 'List procurement POs'),
(gen_random_uuid(), 'procurement.purchase-order.update', 'procurement', 'purchase-order', 'update', 'Update procurement PO'),
(gen_random_uuid(), 'procurement.purchase-order.delete', 'procurement', 'purchase-order', 'delete', 'Delete procurement PO'),
(gen_random_uuid(), 'procurement.purchase-order.submit', 'procurement', 'purchase-order', 'submit', 'Submit procurement PO'),
(gen_random_uuid(), 'procurement.purchase-order.approve', 'procurement', 'purchase-order', 'approve', 'Approve procurement PO'),
(gen_random_uuid(), 'procurement.purchase-order.cancel', 'procurement', 'purchase-order', 'cancel', 'Cancel procurement PO'),

(gen_random_uuid(), 'procurement.rfq.create', 'procurement', 'rfq', 'create', 'Create procurement RFQ'),
(gen_random_uuid(), 'procurement.rfq.read', 'procurement', 'rfq', 'read', 'View procurement RFQ'),
(gen_random_uuid(), 'procurement.rfq.list', 'procurement', 'rfq', 'list', 'List procurement RFQs'),
(gen_random_uuid(), 'procurement.rfq.update', 'procurement', 'rfq', 'update', 'Update procurement RFQ'),
(gen_random_uuid(), 'procurement.rfq.delete', 'procurement', 'rfq', 'delete', 'Delete procurement RFQ'),
(gen_random_uuid(), 'procurement.rfq.publish', 'procurement', 'rfq', 'publish', 'Publish procurement RFQ'),
(gen_random_uuid(), 'procurement.rfq.close', 'procurement', 'rfq', 'close', 'Close procurement RFQ'),
(gen_random_uuid(), 'procurement.rfq.cancel', 'procurement', 'rfq', 'cancel', 'Cancel procurement RFQ'),

(gen_random_uuid(), 'procurement.contract.create', 'procurement', 'contract', 'create', 'Create contract'),
(gen_random_uuid(), 'procurement.contract.read', 'procurement', 'contract', 'read', 'View contract'),
(gen_random_uuid(), 'procurement.contract.list', 'procurement', 'contract', 'list', 'List contracts'),
(gen_random_uuid(), 'procurement.contract.update', 'procurement', 'contract', 'update', 'Update contract'),
(gen_random_uuid(), 'procurement.contract.delete', 'procurement', 'contract', 'delete', 'Delete contract'),
(gen_random_uuid(), 'procurement.contract.activate', 'procurement', 'contract', 'activate', 'Activate contract'),
(gen_random_uuid(), 'procurement.contract.terminate', 'procurement', 'contract', 'terminate', 'Terminate contract'),
(gen_random_uuid(), 'procurement.contract.renew', 'procurement', 'contract', 'renew', 'Renew contract'),

(gen_random_uuid(), 'procurement.vendor-evaluation.create', 'procurement', 'vendor-evaluation', 'create', 'Create vendor evaluation'),
(gen_random_uuid(), 'procurement.vendor-evaluation.read', 'procurement', 'vendor-evaluation', 'read', 'View vendor evaluation'),
(gen_random_uuid(), 'procurement.vendor-evaluation.list', 'procurement', 'vendor-evaluation', 'list', 'List vendor evaluations'),
(gen_random_uuid(), 'procurement.vendor-evaluation.update', 'procurement', 'vendor-evaluation', 'update', 'Update vendor evaluation'),
(gen_random_uuid(), 'procurement.vendor-evaluation.delete', 'procurement', 'vendor-evaluation', 'delete', 'Delete vendor evaluation'),
(gen_random_uuid(), 'procurement.vendor-evaluation.approve', 'procurement', 'vendor-evaluation', 'approve', 'Approve vendor evaluation'),

(gen_random_uuid(), 'procurement.analytics.read', 'procurement', 'analytics', 'read', 'View procurement analytics'),

-- ===================== PRODUCTION MODULE =====================
(gen_random_uuid(), 'production.dashboard.read', 'production', 'dashboard', 'read', 'View production dashboard'),

(gen_random_uuid(), 'production.work-order.create', 'production', 'work-order', 'create', 'Create work order'),
(gen_random_uuid(), 'production.work-order.read', 'production', 'work-order', 'read', 'View work order'),
(gen_random_uuid(), 'production.work-order.list', 'production', 'work-order', 'list', 'List work orders'),
(gen_random_uuid(), 'production.work-order.update', 'production', 'work-order', 'update', 'Update work order'),
(gen_random_uuid(), 'production.work-order.delete', 'production', 'work-order', 'delete', 'Delete work order'),

(gen_random_uuid(), 'production.quality-control.create', 'production', 'quality-control', 'create', 'Create quality control'),
(gen_random_uuid(), 'production.quality-control.read', 'production', 'quality-control', 'read', 'View quality control'),
(gen_random_uuid(), 'production.quality-control.list', 'production', 'quality-control', 'list', 'List quality controls'),
(gen_random_uuid(), 'production.quality-control.update', 'production', 'quality-control', 'update', 'Update quality control'),
(gen_random_uuid(), 'production.quality-control.delete', 'production', 'quality-control', 'delete', 'Delete quality control'),

(gen_random_uuid(), 'production.production-plan.create', 'production', 'production-plan', 'create', 'Create production plan'),
(gen_random_uuid(), 'production.production-plan.read', 'production', 'production-plan', 'read', 'View production plan'),
(gen_random_uuid(), 'production.production-plan.list', 'production', 'production-plan', 'list', 'List production plans'),
(gen_random_uuid(), 'production.production-plan.update', 'production', 'production-plan', 'update', 'Update production plan'),
(gen_random_uuid(), 'production.production-plan.delete', 'production', 'production-plan', 'delete', 'Delete production plan'),
(gen_random_uuid(), 'production.production-plan.approve', 'production', 'production-plan', 'approve', 'Approve production plan'),
(gen_random_uuid(), 'production.production-plan.activate', 'production', 'production-plan', 'activate', 'Activate production plan'),
(gen_random_uuid(), 'production.production-plan.complete', 'production', 'production-plan', 'complete', 'Complete production plan'),
(gen_random_uuid(), 'production.production-plan.cancel', 'production', 'production-plan', 'cancel', 'Cancel production plan'),

-- ===================== CALENDAR MODULE =====================
(gen_random_uuid(), 'calendar.event.create', 'calendar', 'event', 'create', 'Create calendar event'),
(gen_random_uuid(), 'calendar.event.read', 'calendar', 'event', 'read', 'View calendar event'),
(gen_random_uuid(), 'calendar.event.list', 'calendar', 'event', 'list', 'List calendar events'),
(gen_random_uuid(), 'calendar.event.update', 'calendar', 'event', 'update', 'Update calendar event'),
(gen_random_uuid(), 'calendar.event.delete', 'calendar', 'event', 'delete', 'Delete calendar event'),

(gen_random_uuid(), 'calendar.attendee.create', 'calendar', 'attendee', 'create', 'Add attendee'),
(gen_random_uuid(), 'calendar.attendee.update', 'calendar', 'attendee', 'update', 'Update attendee'),
(gen_random_uuid(), 'calendar.attendee.delete', 'calendar', 'attendee', 'delete', 'Remove attendee'),

-- ===================== NOTIFICATIONS MODULE =====================
(gen_random_uuid(), 'notifications.notification.read', 'notifications', 'notification', 'read', 'View notification'),
(gen_random_uuid(), 'notifications.notification.list', 'notifications', 'notification', 'list', 'List notifications'),
(gen_random_uuid(), 'notifications.notification.update', 'notifications', 'notification', 'update', 'Update notification'),
(gen_random_uuid(), 'notifications.notification.delete', 'notifications', 'notification', 'delete', 'Delete notification'),

-- ===================== INVITATIONS MODULE =====================
(gen_random_uuid(), 'invitations.invitation.create', 'invitations', 'invitation', 'create', 'Create invitation'),
(gen_random_uuid(), 'invitations.invitation.read', 'invitations', 'invitation', 'read', 'View invitation'),
(gen_random_uuid(), 'invitations.invitation.list', 'invitations', 'invitation', 'list', 'List invitations'),
(gen_random_uuid(), 'invitations.invitation.delete', 'invitations', 'invitation', 'delete', 'Delete invitation'),
(gen_random_uuid(), 'invitations.invitation.revoke', 'invitations', 'invitation', 'revoke', 'Revoke invitation'),
(gen_random_uuid(), 'invitations.invitation.resend', 'invitations', 'invitation', 'resend', 'Resend invitation'),

-- ===================== PROFILE MODULE =====================
(gen_random_uuid(), 'profile.profile.read', 'profile', 'profile', 'read', 'View own profile'),
(gen_random_uuid(), 'profile.profile.update', 'profile', 'profile', 'update', 'Update own profile'),

-- ===================== SETTINGS MODULE =====================
(gen_random_uuid(), 'settings.setting.read', 'settings', 'setting', 'read', 'View settings'),
(gen_random_uuid(), 'settings.setting.list', 'settings', 'setting', 'list', 'List settings'),
(gen_random_uuid(), 'settings.setting.update', 'settings', 'setting', 'update', 'Update settings'),
(gen_random_uuid(), 'settings.setting.audit', 'settings', 'setting', 'audit', 'View settings audit log'),

-- ===================== ADMIN MODULE =====================
(gen_random_uuid(), 'admin.role.create', 'admin', 'role', 'create', 'Create role'),
(gen_random_uuid(), 'admin.role.read', 'admin', 'role', 'read', 'View role'),
(gen_random_uuid(), 'admin.role.list', 'admin', 'role', 'list', 'List roles'),
(gen_random_uuid(), 'admin.role.update', 'admin', 'role', 'update', 'Update role'),
(gen_random_uuid(), 'admin.role.delete', 'admin', 'role', 'delete', 'Delete role'),

(gen_random_uuid(), 'admin.permission.read', 'admin', 'permission', 'read', 'View permission'),
(gen_random_uuid(), 'admin.permission.list', 'admin', 'permission', 'list', 'List permissions'),

(gen_random_uuid(), 'admin.user-role.assign', 'admin', 'user-role', 'assign', 'Assign role to user'),
(gen_random_uuid(), 'admin.user-role.revoke', 'admin', 'user-role', 'revoke', 'Revoke role from user'),
(gen_random_uuid(), 'admin.user-role.read', 'admin', 'user-role', 'read', 'View user roles'),

(gen_random_uuid(), 'admin.audit.read', 'admin', 'audit', 'read', 'View audit log'),
(gen_random_uuid(), 'admin.audit.list', 'admin', 'audit', 'list', 'List audit log entries')

ON CONFLICT (code) DO NOTHING;

-- +goose Down
DELETE FROM permissions WHERE module IN ('masterdata', 'accounting', 'inventory', 'sales', 'shipping', 'finance', 'hr', 'procurement', 'production', 'calendar', 'notifications', 'invitations', 'profile', 'settings', 'admin');

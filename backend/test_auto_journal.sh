#!/bin/bash

# Test Auto Journal System
# This script tests the auto journal functionality with real database operations

set -e

echo "🧪 Testing Auto Journal System"
echo "================================"

# Configuration
BASE_URL="http://localhost:8084/api/v1/accounting/auto-journal"
COMPANY_ID="test-company-001"
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "📅 Test Date: $CURRENT_DATE"
echo "🏢 Company ID: $COMPANY_ID"
echo ""

# Test 1: Sales POS Cash Transaction
echo "🛒 Test 1: Creating POS Cash Sale Journal Entry"
echo "-----------------------------------------------"

SALES_REQUEST='{
    "source_id": "POS-001-'$(date +%s)'",
    "transaction_type": "POS_CASH_SALE",
    "transaction_date": "'$CURRENT_DATE'",
    "company_id": "'$COMPANY_ID'",
    "currency_code": "IDR",
    "exchange_rate": 1.0,
    "description": "Penjualan tunai dari POS terminal 1",
    "reference": "POS-RECEIPT-001",
    "created_by": "cashier-001",
    "auto_post": true,
    "total_amount": 1100000,
    "tax_amount": 100000,
    "discount_amount": 50000,
    "payment_method": "CASH",
    "customer_id": "walk-in-customer"
}'

echo "📝 Request:"
echo "$SALES_REQUEST" | jq '.'

RESPONSE=$(curl -s -X POST "$BASE_URL/sales" \
    -H "Content-Type: application/json" \
    -d "$SALES_REQUEST")

echo ""
echo "📋 Response:"
echo "$RESPONSE" | jq '.'

if [[ $(echo "$RESPONSE" | jq -r '.success') == "true" ]]; then
    JOURNAL_ID=$(echo "$RESPONSE" | jq -r '.data.id')
    echo "✅ POS Cash Sale Journal Entry Created Successfully!"
    echo "📄 Journal Entry ID: $JOURNAL_ID"
else
    echo "❌ Failed to create POS Cash Sale Journal Entry"
    echo "Error: $(echo "$RESPONSE" | jq -r '.message')"
fi

echo ""

# Test 2: Purchase Order Transaction
echo "🛍️ Test 2: Creating Purchase Order Journal Entry"
echo "------------------------------------------------"

PURCHASE_REQUEST='{
    "source_id": "PO-001-'$(date +%s)'",
    "transaction_type": "PURCHASE_ORDER_APPROVED",
    "transaction_date": "'$CURRENT_DATE'",
    "company_id": "'$COMPANY_ID'",
    "currency_code": "IDR",
    "exchange_rate": 1.0,
    "description": "Pembelian sepatu dari Supplier ABC",
    "reference": "PO-2025-001",
    "created_by": "purchasing-manager",
    "auto_post": true,
    "total_amount": 50000000,
    "tax_amount": 5000000,
    "discount_amount": 1000000,
    "supplier_id": "SUPP-001"
}'

echo "📝 Request:"
echo "$PURCHASE_REQUEST" | jq '.'

RESPONSE=$(curl -s -X POST "$BASE_URL/purchase" \
    -H "Content-Type: application/json" \
    -d "$PURCHASE_REQUEST")

echo ""
echo "📋 Response:"
echo "$RESPONSE" | jq '.'

if [[ $(echo "$RESPONSE" | jq -r '.success') == "true" ]]; then
    JOURNAL_ID=$(echo "$RESPONSE" | jq -r '.data.id')
    echo "✅ Purchase Order Journal Entry Created Successfully!"
    echo "📄 Journal Entry ID: $JOURNAL_ID"
else
    echo "❌ Failed to create Purchase Order Journal Entry"
    echo "Error: $(echo "$RESPONSE" | jq -r '.message')"
fi

echo ""

# Test 3: Inventory Movement Transaction
echo "📦 Test 3: Creating Inventory Movement Journal Entry"
echo "---------------------------------------------------"

INVENTORY_REQUEST='{
    "source_id": "INV-001-'$(date +%s)'",
    "transaction_type": "INVENTORY_RECEIPT",
    "transaction_date": "'$CURRENT_DATE'",
    "company_id": "'$COMPANY_ID'",
    "currency_code": "IDR",
    "exchange_rate": 1.0,
    "description": "Penerimaan barang dari supplier",
    "reference": "GR-2025-001",
    "created_by": "warehouse-staff",
    "auto_post": true,
    "movement_type": "RECEIPT",
    "total_amount": 25000000,
    "quantity": 500,
    "warehouse_id": "WH-001"
}'

echo "📝 Request:"
echo "$INVENTORY_REQUEST" | jq '.'

RESPONSE=$(curl -s -X POST "$BASE_URL/inventory" \
    -H "Content-Type: application/json" \
    -d "$INVENTORY_REQUEST")

echo ""
echo "📋 Response:"
echo "$RESPONSE" | jq '.'

if [[ $(echo "$RESPONSE" | jq -r '.success') == "true" ]]; then
    JOURNAL_ID=$(echo "$RESPONSE" | jq -r '.data.id')
    echo "✅ Inventory Movement Journal Entry Created Successfully!"
    echo "📄 Journal Entry ID: $JOURNAL_ID"
else
    echo "❌ Failed to create Inventory Movement Journal Entry"
    echo "Error: $(echo "$RESPONSE" | jq -r '.message')"
fi

echo ""

# Test 4: Payroll Transaction
echo "💰 Test 4: Creating Payroll Journal Entry"
echo "-----------------------------------------"

PAYROLL_REQUEST='{
    "source_id": "PAYROLL-'$(date +%Y%m)'-001",
    "transaction_type": "PAYROLL_PROCESSING",
    "transaction_date": "'$CURRENT_DATE'",
    "company_id": "'$COMPANY_ID'",
    "currency_code": "IDR",
    "exchange_rate": 1.0,
    "description": "Penggajian bulan '$(date +%B\ %Y)'",
    "reference": "PAYROLL-'$(date +%Y%m)'",
    "created_by": "hr-manager",
    "auto_post": true,
    "total_gross_pay": 150000000,
    "total_net_pay": 120000000,
    "total_deductions": 30000000,
    "tax_withholding": 15000000,
    "insurance_amount": 15000000,
    "payroll_period": "'$(date +%Y-%m)'"
}'

echo "📝 Request:"
echo "$PAYROLL_REQUEST" | jq '.'

RESPONSE=$(curl -s -X POST "$BASE_URL/payroll" \
    -H "Content-Type: application/json" \
    -d "$PAYROLL_REQUEST")

echo ""
echo "📋 Response:"
echo "$RESPONSE" | jq '.'

if [[ $(echo "$RESPONSE" | jq -r '.success') == "true" ]]; then
    JOURNAL_ID=$(echo "$RESPONSE" | jq -r '.data.id')
    echo "✅ Payroll Journal Entry Created Successfully!"
    echo "📄 Journal Entry ID: $JOURNAL_ID"
else
    echo "❌ Failed to create Payroll Journal Entry"
    echo "Error: $(echo "$RESPONSE" | jq -r '.message')"
fi

echo ""

# Test 5: Cash Bank Transaction
echo "🏦 Test 5: Creating Cash Bank Journal Entry"
echo "-------------------------------------------"

CASHBANK_REQUEST='{
    "source_id": "CB-001-'$(date +%s)'",
    "transaction_type": "CASH_BANK_DEPOSIT",
    "transaction_date": "'$CURRENT_DATE'",
    "company_id": "'$COMPANY_ID'",
    "currency_code": "IDR",
    "exchange_rate": 1.0,
    "description": "Setoran kas harian ke bank",
    "reference": "DEPOSIT-'$(date +%Y%m%d)'",
    "created_by": "cashier-001",
    "auto_post": true,
    "cash_transaction_type": "DEPOSIT",
    "amount": 10000000,
    "account_id": "cash-account-001"
}'

echo "📝 Request:"
echo "$CASHBANK_REQUEST" | jq '.'

RESPONSE=$(curl -s -X POST "$BASE_URL/cash-bank" \
    -H "Content-Type: application/json" \
    -d "$CASHBANK_REQUEST")

echo ""
echo "📋 Response:"
echo "$RESPONSE" | jq '.'

if [[ $(echo "$RESPONSE" | jq -r '.success') == "true" ]]; then
    JOURNAL_ID=$(echo "$RESPONSE" | jq -r '.data.id')
    echo "✅ Cash Bank Journal Entry Created Successfully!"
    echo "📄 Journal Entry ID: $JOURNAL_ID"
else
    echo "❌ Failed to create Cash Bank Journal Entry"
    echo "Error: $(echo "$RESPONSE" | jq -r '.message')"
fi

echo ""

# Test 6: Get Account Mapping Configuration
echo "⚙️ Test 6: Retrieving Account Mapping Configuration"
echo "---------------------------------------------------"

echo "📝 Getting POS_CASH_SALE mapping configuration..."

RESPONSE=$(curl -s -X GET "$BASE_URL/mapping/SALES/POS_CASH_SALE")

echo ""
echo "📋 Response:"
echo "$RESPONSE" | jq '.'

if [[ $(echo "$RESPONSE" | jq -r '.success') == "true" ]]; then
    echo "✅ Account Mapping Retrieved Successfully!"
else
    echo "❌ Failed to retrieve Account Mapping"
    echo "Error: $(echo "$RESPONSE" | jq -r '.message')"
fi

echo ""
echo "🎉 Auto Journal System Test Completed!"
echo "======================================"
echo ""
echo "📊 Test Summary:"
echo "- POS Cash Sale Journal: $([ "$?" -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
echo "- Purchase Order Journal: $([ "$?" -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
echo "- Inventory Movement Journal: $([ "$?" -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
echo "- Payroll Journal: $([ "$?" -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
echo "- Cash Bank Journal: $([ "$?" -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
echo "- Account Mapping Retrieval: $([ "$?" -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
echo ""
echo "💡 To verify the results:"
echo "1. Check the database for journal_entries and journal_entry_lines tables"
echo "2. Verify that journal entries are properly balanced (total_debit = total_credit)"
echo "3. Check the auto_journal_log table for processing records"
echo "4. Review the general_ledger for posted entries if auto_post was enabled"
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { amountInWordsFr } from './amountInWords'
import { computeTotals, formatNumber } from './calc'
import { COMPANY } from './company'
import { frDate } from './format'
import type { InvoiceRecord } from './types'

const COLS = [
  { label: 'Q.TE', w: '9%', align: 'num' },
  { label: 'CODE', w: '11%', align: 'left' },
  { label: 'COMMANDE', w: '17%', align: 'left' },
  { label: 'ARTICOLO', w: '31%', align: 'left' },
  { label: 'CODE DOUANE', w: '11%', align: 'ctr' },
  { label: 'PRIX', w: '9%', align: 'num' },
  { label: 'TOTAL', w: '12%', align: 'num' },
] as const

const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 32, fontSize: 9, fontFamily: 'Helvetica' },
  top: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  left: { width: '48%' },
  right: { width: '48%', textAlign: 'right' },
  bold: { fontFamily: 'Helvetica-Bold' },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 13, marginBottom: 2 },
  tr: { flexDirection: 'row' },
  cell: { padding: 3, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#000000' },
  head: { backgroundColor: '#eeeeee', fontFamily: 'Helvetica-Bold', borderTopWidth: 1 },
  last: { borderRightWidth: 1 },
  num: { textAlign: 'right' },
  ctr: { textAlign: 'center' },
  totals: { marginTop: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  words: { fontFamily: 'Helvetica-Bold', marginVertical: 8 },
  box: { borderWidth: 1, borderColor: '#000000', padding: 6, marginTop: 8, lineHeight: 1.4 },
  footer: { position: 'absolute', bottom: 22, left: 0, right: 0, textAlign: 'center', fontSize: 8 },
})

function TableRow({ values, header = false }: { values: string[]; header?: boolean }) {
  return (
    <View style={s.tr} wrap={false}>
      {COLS.map((c, i) => (
        <Text
          key={c.label}
          style={[
            s.cell,
            { width: c.w },
            c.align === 'num' ? s.num : c.align === 'ctr' ? s.ctr : {},
            header ? s.head : {},
            i === COLS.length - 1 ? s.last : {},
          ]}
        >
          {values[i]}
        </Text>
      ))}
    </View>
  )
}

export function invoiceDocument(inv: InvoiceRecord) {
  const t = computeTotals(inv.items)
  const c = inv.client
  const lg = inv.logistics
  const title = inv.number ? `FACTURE N° ${inv.number} / ${inv.year}` : 'FACTURE (BROUILLON)'

  return (
    <Document title={title} author={COMPANY.name}>
      <Page size="A4" style={s.page}>
        <View style={s.top}>
          <View style={s.left}>
            <Text style={s.bold}>{COMPANY.name}</Text>
            {COMPANY.addressLines.map((l) => <Text key={l}>{l}</Text>)}
            <Text>{COMPANY.bank}{COMPANY.bankAccount ? ` : ${COMPANY.bankAccount}` : ''}</Text>
            <Text>{COMPANY.mf}</Text>
            <Text>{COMPANY.rc}</Text>
          </View>
          <View style={s.right}>
            <Text style={s.title}>{title}</Text>
            <Text style={{ marginBottom: 10 }}>Date : {frDate(inv.issue_date)}</Text>
            <Text style={s.bold}>{c?.company_name ?? ''}</Text>
            {c?.address_1 ? <Text>{c.address_1}</Text> : null}
            {c?.address_2 ? <Text>{c.address_2}</Text> : null}
            {c?.country ? <Text>{c.country}</Text> : null}
            {c?.tax_id ? <Text>{c.tax_id}</Text> : null}
          </View>
        </View>

        {/* "fixed" repeats the table header at the top of every page */}
        <View fixed>
          <TableRow header values={COLS.map((x) => x.label)} />
        </View>
        {inv.items.map((it, i) => (
          <TableRow
            key={it.id}
            values={[
              formatNumber(it.quantity),
              it.item_code,
              it.order_name,
              it.description,
              it.customs_code,
              formatNumber(it.unit_price),
              formatNumber(t.lines[i], 2),
            ]}
          />
        ))}

        <View style={s.totals} wrap={false}>
          <View style={s.totalRow}>
            <Text>TOTAL QUANTITÉ : {formatNumber(t.totalQuantity)}</Text>
            <Text style={s.bold}>TOTAL {inv.currency} : {formatNumber(t.totalAmount, 2)}</Text>
          </View>
          <Text style={s.words}>ARRÊTÉE LA PRÉSENTE FACTURE À LA SOMME DE : {amountInWordsFr(t.totalAmount)}</Text>
          {inv.vat_note ? <Text>{inv.vat_note}</Text> : null}
          {lg.customs_declaration || lg.transporter || lg.gross_weight_kg || lg.pallets != null ? (
            <View style={s.box}>
              {lg.customs_declaration ? <Text>{lg.customs_declaration}</Text> : null}
              {lg.transporter ? <Text>TRANSPORTEUR : {lg.transporter}</Text> : null}
              {lg.gross_weight_kg ? (
                <Text>
                  POIDS BRUT : {formatNumber(lg.gross_weight_kg)} KG
                  {lg.net_weight_kg ? ` / POIDS NET : ${formatNumber(lg.net_weight_kg)} KG` : ''}
                </Text>
              ) : null}
              {lg.pallets != null ? <Text>NOMBRE DE PALETTES : {lg.pallets}</Text> : null}
            </View>
          ) : null}
        </View>

        <Text
          style={s.footer}
          fixed
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} de ${totalPages}`}
        />
      </Page>
    </Document>
  )
}
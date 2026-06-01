import jsPDF from 'jspdf'

export default function ContratPDF({ location }) {
  const generatePDF = () => {
    const doc = new jsPDF()

    // Couleurs
    const navyColor = [13, 21, 38]
    const blueColor = [37, 99, 235]
    const whiteColor = [255, 255, 255]
    const grayColor = [100, 116, 139]

    // Header fond bleu
    doc.setFillColor(...blueColor)
    doc.rect(0, 0, 210, 40, 'F')

    // Titre
    doc.setTextColor(...whiteColor)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('CONTRAT DE LOCATION', 105, 18, { align: 'center' })

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('AutoLocation — Gestion de flotte', 105, 28, { align: 'center' })

    // Numéro contrat
    doc.setFontSize(10)
    doc.text(`N° ${location.id?.slice(0, 8).toUpperCase() || 'XXXXXXXX'}`, 105, 36, { align: 'center' })

    // Date
    doc.setTextColor(...grayColor)
    doc.setFontSize(10)
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 15, 50)

    // Section Client
    doc.setFillColor(240, 244, 255)
    doc.rect(10, 55, 90, 50, 'F')
    doc.setTextColor(...blueColor)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMATIONS CLIENT', 15, 65)

    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Nom : ${location.clients?.prenom || ''} ${location.clients?.nom || ''}`, 15, 75)
    doc.text(`Email : ${location.clients?.email || '—'}`, 15, 83)
    doc.text(`Téléphone : ${location.clients?.telephone || '—'}`, 15, 91)
    doc.text(`N° Permis : ${location.clients?.permis_numero || '—'}`, 15, 99)

    // Section Véhicule
    doc.setFillColor(240, 255, 244)
    doc.rect(110, 55, 90, 50, 'F')
    doc.setTextColor(...blueColor)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('VÉHICULE', 115, 65)

    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Marque : ${location.vehicules?.marque || '—'}`, 115, 75)
    doc.text(`Modèle : ${location.vehicules?.modele || '—'}`, 115, 83)
    doc.text(`Immat. : ${location.vehicules?.immatriculation || '—'}`, 115, 91)
    doc.text(`Tarif/jour : ${location.vehicules?.tarif_journalier || '—'}£`, 115, 99)

    // Section Détails location
    doc.setFillColor(...navyColor)
    doc.rect(10, 115, 190, 8, 'F')
    doc.setTextColor(...whiteColor)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('DÉTAILS DE LA LOCATION', 15, 121)

    // Tableau détails
    const details = [
      ['Date de début', new Date(location.date_debut).toLocaleDateString('fr-FR')],
      ['Date de fin', new Date(location.date_fin).toLocaleDateString('fr-FR')],
      ['Durée', `${Math.ceil((new Date(location.date_fin) - new Date(location.date_debut)) / (1000 * 60 * 60 * 24))} jours`],
      ['Statut', location.statut?.replace('_', ' ').toUpperCase() || '—'],
      ['Montant total', `${location.montant_total} £`],
    ]

    let y = 132
    details.forEach(([label, value], i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(10, y - 5, 190, 10, 'F')
      }
      doc.setTextColor(...grayColor)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(label, 15, y)
      doc.setTextColor(30, 30, 30)
      doc.setFont('helvetica', 'bold')
      doc.text(value, 120, y)
      y += 12
    })

    // Montant total encadré
    doc.setFillColor(...blueColor)
    doc.rect(10, y + 5, 190, 15, 'F')
    doc.setTextColor(...whiteColor)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(`MONTANT TOTAL : ${location.montant_total} £`, 105, y + 15, { align: 'center' })

    // Notes
    if (location.notes) {
      y += 30
      doc.setTextColor(...grayColor)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('NOTES :', 15, y + 10)
      doc.setFont('helvetica', 'normal')
      doc.text(location.notes, 15, y + 18)
    }

    // Signatures
    const sigY = 230
    doc.setDrawColor(...grayColor)
    doc.setTextColor(...grayColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    doc.line(15, sigY, 85, sigY)
    doc.text('Signature Client', 50, sigY + 8, { align: 'center' })

    doc.line(125, sigY, 195, sigY)
    doc.text('Signature AutoLocation', 160, sigY + 8, { align: 'center' })

    // Footer
    doc.setFillColor(...navyColor)
    doc.rect(0, 280, 210, 17, 'F')
    doc.setTextColor(...whiteColor)
    doc.setFontSize(9)
    doc.text('AutoLocation — Tous droits réservés', 105, 290, { align: 'center' })

    // Télécharger
    doc.save(`contrat_${location.clients?.nom || 'client'}_${location.id?.slice(0, 8) || 'xxx'}.pdf`)
  }

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
    >
      📄 Contrat PDF
    </button>
  )
}
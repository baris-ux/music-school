import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ConfidentialitePage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10 text-gray-800">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
          <p className="text-sm text-gray-500">Conformément au RGPD (UE) 2016/679</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">1. Responsable du traitement</h2>
          <p className="text-sm leading-relaxed">
            L'école de musique, dont le siège est situé à Bruxelles, Belgique, est responsable du
            traitement de vos données personnelles. Pour toute question relative à vos données,
            vous pouvez nous contacter à l'adresse{" "}
            <a href="mailto:vedatbayer06@hotmail.com" className="text-blue-600 hover:underline">
              vedatbayer06@hotmail.com
            </a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">2. Données collectées</h2>
          <p className="text-sm leading-relaxed">Nous collectons les données suivantes :</p>
          <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
            <li>Nom et prénom</li>
            <li>Adresse e-mail</li>
            <li>Numéro de téléphone (optionnel)</li>
            <li>Données de présence aux cours</li>
            <li>Informations de paiement (traitées par Stripe — nous ne stockons pas vos données bancaires)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">3. Finalité du traitement</h2>
          <p className="text-sm leading-relaxed">
            Vos données sont collectées uniquement dans le cadre de la gestion de votre inscription
            et de vos cours à l'école de musique. Elles ne sont pas utilisées à des fins
            commerciales ou transmises à des tiers sans votre consentement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">4. Base légale</h2>
          <p className="text-sm leading-relaxed">
            Le traitement de vos données repose sur la base contractuelle (article 6.1.b du RGPD) —
            vos données sont nécessaires à l'exécution de la relation entre vous et l'école de
            musique.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">5. Durée de conservation</h2>
          <p className="text-sm leading-relaxed">
            Vos données sont conservées pendant toute la durée de votre relation avec l'école de
            musique. À la fin de cette relation, elles sont supprimées sur demande.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">6. Vos droits</h2>
          <p className="text-sm leading-relaxed">Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
            <li><span className="font-medium">Droit d'accès</span> — obtenir une copie de vos données</li>
            <li><span className="font-medium">Droit de rectification</span> — corriger des données inexactes</li>
            <li><span className="font-medium">Droit à l'effacement</span> — demander la suppression de vos données</li>
            <li><span className="font-medium">Droit à la portabilité</span> — recevoir vos données dans un format lisible</li>
          </ul>
          <p className="text-sm leading-relaxed">
            Pour exercer ces droits, contactez-nous à{" "}
            <a href="mailto:vedatbayer06@hotmail.com" className="text-blue-600 hover:underline">
              vedatbayer06@hotmail.com
            </a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">7. Réclamation</h2>
          <p className="text-sm leading-relaxed">
            Vous avez le droit d'introduire une réclamation auprès de l'Autorité de Protection des
            Données (APD) :{" "}
            <a
              href="https://www.autoriteprotectiondonnees.be"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              www.autoriteprotectiondonnees.be
            </a>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

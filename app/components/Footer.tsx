"use client";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaInstagram, FaFacebook } from "react-icons/fa";
import { useLang } from "@/app/context/LangContext";
import { translations } from "@/lib/translations";

export default function Footer() {
  const { lang } = useLang();
  const t = translations[lang].footer;

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">École de musique</h2>
          <p className="text-sm">{t.description}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{t.contact}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail size={16} />
              <a href="mailto:vedatbayer06@hotmail.com" className="hover:text-white transition">
                vedatbayer06@hotmail.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <a href="tel:+32479191784" className="hover:text-white transition">
                +32 479 19 17 84
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>Bruxelles, Belgique</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{t.follow}</h3>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/gitarsazkursbruksel/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 hover:text-white transition"
            >
              <FaInstagram size={18} />
            </a>
            <a
            
              href="https://www.facebook.com/metin.gumus.7106670"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 hover:text-white transition"
            >
              <FaFacebook size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="text-center text-sm py-4 text-gray-500 border-t border-gray-800 space-x-4">
        <span>© {new Date().getFullYear()} École de musique — {t.rights}</span>
        <a href="/confidentialite" className="text-white hover:underline transition">
          {t.privacy}
        </a>
      </div>
    </footer>
  );
}
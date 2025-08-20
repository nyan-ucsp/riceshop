import React from 'react';
import { useTranslation } from 'react-i18next';

const GOOGLE_MAPS_EMBED_URL = "https://www.google.com/maps?q=16.8409,96.1735&z=14&output=embed"; // Yangon center as example

function Contact() {
  const { t } = useTranslation();

  const phone = t('contact.phoneValue');
  const email = t('contact.emailValue');
  const address = t('contact.addressValue');

  return (
    <div className="contact-container">
      <div className="contact-grid">
        <div className="contact-card">
          <h2 className="contact-title">{t('contact.title')}</h2>
          <p>{t('contact.description')}</p>

          <div className="contact-item">
            <span>📞</span>
            <div>
              <div><strong>{t('contact.phoneLabel')}:</strong> <a href={`tel:${phone}`}>{phone}</a></div>
            </div>
          </div>

          <div className="contact-item">
            <span>✉️</span>
            <div>
              <div><strong>{t('contact.emailLabel')}:</strong> <a href={`mailto:${email}`}>{email}</a></div>
            </div>
          </div>

          <div className="contact-item">
            <span>📍</span>
            <div>
              <div><strong>{t('contact.addressLabel')}:</strong> {address}</div>
              <div>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer">{t('contact.viewOnMap')}</a>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-card">
          <iframe
            title="map"
            src={GOOGLE_MAPS_EMBED_URL}
            className="map-frame"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}

export default Contact;



import React from 'react';
import { Link } from 'react-router-dom';
import './LegalLayout.css';

const LegalLayout = ({ title, updatedAt, sections }) => (
    <article className="legal">
        <Link to="/register" className="legal__back">← Quay lại đăng ký</Link>

        <h1 className="legal__title">{title}</h1>
        <p className="legal__updated">Cập nhật lần cuối: {updatedAt}</p>

        {sections.map((section, index) => (
            <section className="legal__section" key={section.heading}>
                <h2 className="legal__heading">
                    <span className="legal__heading-num">{index + 1}.</span>
                    {section.heading}
                </h2>
                {section.paragraphs?.map((text, i) => (
                    <p className="legal__text" key={i}>{text}</p>
                ))}
                {section.items && (
                    <ul className="legal__list">
                        {section.items.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                )}
            </section>
        ))}
    </article>
);

export default LegalLayout;
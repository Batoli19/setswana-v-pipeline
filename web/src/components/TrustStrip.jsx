import { Fragment } from "react";

const ITEMS = [
  "Banking", "Telecoms", "Insurance", "Government",
  "Code-switching", "On-prem", "Batswana voices",
];

export default function TrustStrip() {
  const items = [...ITEMS, ...ITEMS];
  return (
    <section className="strip">
      <div className="strip-track">
        {items.map((label, i) => (
          <Fragment key={i}>
            <span>{label}</span>
            <i>·</i>
          </Fragment>
        ))}
      </div>
    </section>
  );
}

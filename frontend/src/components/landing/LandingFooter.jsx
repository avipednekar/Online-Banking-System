import {
  landingFooterColumns,
  landingFooterPolicies
} from "../../constants/landingContent";

export function LandingFooter() {
  return (
    <footer className="bg-[#00113a] py-20 text-white">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-12 px-6 md:grid-cols-4">
        <div>
          <span className="mb-6 block text-2xl font-black">Vault Financial</span>
          <p className="leading-7 text-[#758dd5]">
            The architectural standard for modern digital banking. Secure, fluid, and
            institutional.
          </p>
        </div>

        {landingFooterColumns.map((column) => (
          <div key={column.title}>
            <h5 className="mb-6 text-lg font-bold">{column.title}</h5>
            <ul className="space-y-4 text-[#758dd5]">
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#" className="transition-colors hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-20 flex max-w-screen-2xl flex-col items-center justify-between gap-6 border-t border-white/5 px-6 pt-8 text-sm text-[#758dd5] md:flex-row">
        <p>(c) 2024 Vault Financial Inc. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-8">
          {landingFooterPolicies.map((policy) => (
            <a key={policy} href="#" className="transition-colors hover:text-white">
              {policy}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

const img = "./assets/b3c7bae3-4a36-419f-9772-c7d5e8807e1f.png";

export default function JsHeader() {
  return (
    <div className="relative size-full" data-node-id="38:3143" data-name="js-header">
      <div className="absolute h-[127.938px] left-0 top-0 w-[141px]" data-node-id="38:3144" data-name="l-header__logo">
        <div className="absolute h-[87.938px] left-[20px] top-[20px] w-[101px]" data-node-id="38:3145" data-name="A">
          <div className="absolute h-[87.938px] left-0 top-0 w-[101px]" data-node-id="38:3146" data-name="ユーミーらいふ">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img} />
          </div>
        </div>
      </div>
      <div className="absolute h-[104px] left-[141px] top-0 w-[234px]" data-node-id="38:3147" data-name="l-header__inner">
        <div className="absolute bg-[#d93f21] left-[150px] rounded-[32px] size-[64px] top-[20px]" data-node-id="38:3148" data-name="l-header-hamburger js-drawer-button">
          <div className="absolute h-[11.281px] left-[18.83px] top-[26.36px] w-[26.344px]" data-node-id="38:3149" data-name="bar">
            <div className="absolute bg-white h-[2px] left-0 top-0 w-[26.344px]" data-node-id="38:3150" data-name="bar::before" />
            <div className="absolute bg-white h-[2px] left-0 top-[9.28px] w-[26.344px]" data-node-id="38:3151" data-name="bar::after" />
          </div>
        </div>
      </div>
    </div>
  );
}

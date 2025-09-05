import Navbars from "./Navbars";

const Header = () => {
  return (
    <section
      className="w-full h-screen overflow-hidden relative z-10"
      id="home"
    >
      <video
        autoPlay
        muted
        loop
        className="w-full min-h-screen object-cover -z-10"
        playsInline
      >
        <source src="/Sequence 03.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="fixed z-10 top-2 w-full justify-center items-center text-center flex    flex-col  text-amber-700">
        <h1 className="text-5xl font-family-marcellus tracking-wide font-bold text-amber-700">
          CRUFFIN
        </h1>
        <Navbars />
      </div>

      <div className="absolute z-10 top-72 transform right-1/2  -translate-x-[120%] flex items-center gap-4 ">
        <p className="font-family-shadows text-2xl text-white opacity-80 ">
          Çıtır Kruvasan
        </p>
        <div className=" h-[0.1px] w-44 bg-slate-300 "></div>
      </div>
      <div className="absolute z-10 top-[500px] transform right-1/2  -translate-x-[172%] flex items-center gap-4 ">
        <p className="font-family-shadows text-2xl text-white opacity-80 ">
          Taze Meyveler
        </p>
        <div className=" h-[0.1px] w-24 bg-slate-300 "></div>
      </div>

      <div className="absolute z-10 top-60 left-1/2 transform translate-x-[84%] flex items-center gap-4 ">
        <div className=" h-[0.1px] w-36 bg-slate-300 "></div>
        <p className="font-family-shadows text-2xl text-white opacity-80 ">
          Eşsiz Belçika Çukalatası
        </p>
      </div>

      <div className="absolute z-10 top-[90vh] left-1/2 transform -translate-x-1/2 flex flex-col justify-center items-center gap-2 ">
        <img src="/scroll.gif" alt="Animasyon" className="w-10 md:w-14" />
      </div>
    </section>
  );
};

export default Header;

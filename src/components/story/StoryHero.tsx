import React from "react";

const StoryHero = ({ heroRef }) => (
  <div className="stories-hero" ref={heroRef}>
    <div className="stories-hero-header">
      <img src="/svg/ocean-archive-1.svg" alt="" />
      <img src="/svg/ocean-archive-2.svg" alt="" />
    </div>
    <div className="stories-hero-item">
      <img
        className="stories-hero-item__image--1"
        alt=""
        src="https://lh3.googleusercontent.com/proxy/ocom7yzDdU3vx8EgqLQgaNR-tF1D-MQvfb3GVSC1TmMjjMKcI4YBPYHtAk0xP2LF0dmC2L0AncXqZls6vT8RcUmYZTHdtG2-ZZQsbTsiU6YzmqG2NbD_Ztr8_Ut3EXReORBll-L0x4s9ZXJulVoIx1tQYtrIIym50ahuIMTn3QGqkFd1Mur3hubOLuDB"
      />
      <h2>The ocean as an economic space</h2>
      <p>Karin Ingersoll</p>
    </div>
    <div className="stories-hero-item">
      <img
        className="stories-hero-item__image--2"
        alt=""
        src="https://lh3.googleusercontent.com/proxy/ocom7yzDdU3vx8EgqLQgaNR-tF1D-MQvfb3GVSC1TmMjjMKcI4YBPYHtAk0xP2LF0dmC2L0AncXqZls6vT8RcUmYZTHdtG2-ZZQsbTsiU6YzmqG2NbD_Ztr8_Ut3EXReORBll-L0x4s9ZXJulVoIx1tQYtrIIym50ahuIMTn3QGqkFd1Mur3hubOLuDB"
      />
      <h2>The ocean as an economic space</h2>
      <p>Karin Ingersoll</p>
    </div>
    <div className="stories-hero-item">
      <img
        className="stories-hero-item__image--3"
        alt=""
        src="https://lh3.googleusercontent.com/proxy/ocom7yzDdU3vx8EgqLQgaNR-tF1D-MQvfb3GVSC1TmMjjMKcI4YBPYHtAk0xP2LF0dmC2L0AncXqZls6vT8RcUmYZTHdtG2-ZZQsbTsiU6YzmqG2NbD_Ztr8_Ut3EXReORBll-L0x4s9ZXJulVoIx1tQYtrIIym50ahuIMTn3QGqkFd1Mur3hubOLuDB"
      />
      <h2>The ocean as an economic space</h2>
      <p>Karin Ingersoll</p>
    </div>
    <img
      src="/svg/circular-variant-2.svg"
      alt=""
      className="stories-hero-illustration"
    />
  </div>
);

export default StoryHero;

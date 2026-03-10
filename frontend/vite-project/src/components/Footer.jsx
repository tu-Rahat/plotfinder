import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>LandMarket</h2>
          <p>Your trusted platform for buying and selling land properties.</p>
        </div>

        <div>
          <h3>Quick Links</h3>
          <p>Browse Properties</p>
          <p>List Your Land</p>
        </div>

        <div>
          <h3>Support</h3>
          <p>Help Center</p>
          <p>Contact Us</p>
        </div>

        <div>
          <h3>Legal</h3>
          <p>Privacy Policy</p>
          <p>Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
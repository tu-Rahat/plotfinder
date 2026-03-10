function Home() {
  const featuredProperties = [
    {
      id: 1,
      title: "Prime Residential Lot - Mountain View",
      location: "Boulder, Colorado",
      price: "$125,000",
      acres: "2.5 acres",
      tag: "Residential",
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
      features: ["Mountain View", "Utilities Available", "+2 more"],
    },
    {
      id: 2,
      title: "Expansive Farmland - Agricultural Opportunity",
      location: "Lancaster County, Pennsylvania",
      price: "$450,000",
      acres: "50 acres",
      tag: "Agricultural",
      image:
        "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=900&q=80",
      features: ["Irrigation", "Barn Included", "+2 more"],
    },
    {
      id: 3,
      title: "Waterfront Property - Private Lake Access",
      location: "Lake Tahoe, Nevada",
      price: "$350,000",
      acres: "3 acres",
      tag: "Recreational",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
      features: ["Lake Access", "Private Beach", "+2 more"],
    },
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Perfect Land</h1>
          <p>
            Discover and purchase land properties across the country. From
            residential lots to expansive farmland, find your ideal investment.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Browse Properties</button>
            <button className="secondary-btn">List Your Land</button>
          </div>
        </div>
      </section>

      <section className="why-choose">
        <h2>Why Choose LandMarket?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon green">📍</div>
            <h3>Wide Selection</h3>
            <p>
              Access thousands of land listings across all regions. Find the
              perfect location for your needs.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">🛡️</div>
            <h3>Secure Transactions</h3>
            <p>
              All transactions are protected with industry-leading security
              measures and trusted escrow services.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">👥</div>
            <h3>Expert Support</h3>
            <p>
              Our team of real estate professionals is here to guide you through
              every step of the process.
            </p>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Properties</h2>
          <button className="view-all-btn">View All</button>
        </div>

        <div className="property-grid">
          {featuredProperties.map((property) => (
            <div className="property-card" key={property.id}>
              <div className="property-image-wrapper">
                <img
                  src={property.image}
                  alt={property.title}
                  className="property-image"
                />
                <span className="property-tag">{property.tag}</span>
              </div>

              <div className="property-content">
                <h3>{property.title}</h3>
                <p className="property-location">📍 {property.location}</p>

                <div className="property-meta">
                  <span className="property-price">{property.price}</span>
                  <span className="property-acres">{property.acres}</span>
                </div>

                <div className="property-features">
                  {property.features.map((feature, index) => (
                    <span key={index} className="feature-pill">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <div>
            <h3>5000+</h3>
            <p>Active Listings</p>
          </div>
          <div>
            <h3>12000+</h3>
            <p>Happy Buyers</p>
          </div>
          <div>
            <h3>50</h3>
            <p>States Covered</p>
          </div>
          <div>
            <h3>$2B+</h3>
            <p>Land Sold</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Find Your Land?</h2>
        <p>
          Join thousands of satisfied customers who found their perfect
          property through LandMarket.
        </p>
        <button className="cta-btn">Get Started Today</button>
      </section>
    </div>
  );
}

export default Home;
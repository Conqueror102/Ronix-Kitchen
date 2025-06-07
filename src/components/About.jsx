import React from "react"

// Custom SVG icons
const Heart = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M12 21s-6.5-5.5-9-8.5C-1.5 8.5 2.5 3 7 5.5 9 6.5 12 9 12 9s3-2.5 5-3.5C21.5 3 25.5 8.5 21 12.5c-2.5 3-9 8.5-9 8.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const Users = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="17" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
    <path
      d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M17 17v-1a4 4 0 014-4h1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const Award = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
    <path
      d="M8.21 13.89l-1.42 4.24a1 1 0 001.45 1.12l3.76-2.18 3.76 2.18a1 1 0 001.45-1.12l-1.42-4.24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const Clock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 6v6l4 2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MapPin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M12 21s-6-5.686-6-10A6 6 0 1112 21z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const Phone = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M22 16.92V21a1 1 0 01-1.09 1A19.91 19.91 0 013 5.09 1 1 0 014 4h4.09a1 1 0 011 .75l1.13 4.52a1 1 0 01-.29 1L8.21 12.79a16 16 0 007 7l2.52-2.52a1 1 0 011-.29l4.52 1.13a1 1 0 01.75 1V16.92z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

// Custom Badge component
const Badge = ({ className = "", children }) => (
  <span className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${className}`}>
    {children}
  </span>
);

// Custom Card and CardContent components
const Card = ({ className = "", children }) => (
  <div className={`bg-white/90 rounded-xl shadow-md ${className}`}>{children}</div>
);

const CardContent = ({ className = "", children }) => (
  <div className={className}>{children}</div>
);

// Custom Image component (uses <img> for compatibility)
const Image = ({ src, alt, width, height, className }) => (
  <img src={src} alt={alt} width={width} height={height} className={className} />
);

// Custom Button component
const Button = ({ className = "", children, ...props }) => (
  <button className={`px-5 py-3 rounded-lg font-semibold transition-colors ${className}`} {...props}>
    {children}
  </button>
);

// Customer Service SVG icons (no emoji)
const customerIcons = [
  // Personalized Attention
  (
    <svg className="w-8 h-8 text-vibrantOrange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z"
      />
    </svg>
  ),
  // Swift Response
  (
    <svg className="w-8 h-8 text-vibrantOrange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  // Satisfaction Guarantee
  (
    <svg className="w-8 h-8 text-vibrantOrange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
    </svg>
  ),
  // Special Occasions
  (
    <svg className="w-8 h-8 text-vibrantOrange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z"
      />
    </svg>
  ),
  // Continuous Improvement
  (
    <svg className="w-8 h-8 text-vibrantOrange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582M20 20v-5h-.581M5.635 17.657A9 9 0 1112 21v-1"
      />
    </svg>
  ),
  // Relationship Building
  (
    <svg className="w-8 h-8 text-vibrantOrange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a4 4 0 00-4-4h-1M7 20H2v-2a4 4 0 014-4h1m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 4a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-200">Our Story</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">About Ronix Spices </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Where authentic Italian flavors meet modern culinary artistry. A family tradition spanning three
            generations, bringing you the finest dining experience.
          </p>
        </div>
      </section>

      {/* Owner Story Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="/placeholder.svg?height=600&width=500"
                alt="Chef Marco Rossi"
                width={500}
                height={600}
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="space-y-6">
              <div>
                <Badge className="mb-4 bg-red-100 text-red-800 hover:bg-red-200">Meet the Owner</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Chef Marco Rossi</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Born in the heart of Tuscany, Chef Marco brings over 25 years of culinary expertise to every dish. His
                  passion for authentic Italian cuisine began in his grandmother's kitchen, where he learned the secrets
                  of traditional recipes passed down through generations.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  After training in renowned restaurants across Italy and France, Marco opened Bella Vista with a simple
                  mission: to share the warmth and flavors of his homeland with our community.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="text-sm">
                    25+ Years Experience
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Michelin Trained
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Italian Heritage
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">Our Team</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Culinary Family</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every member of our team shares the same passion for exceptional food and hospitality
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[

              {
                name: "Sofia Martinez",
                role: "Head Chef",
                image: "/placeholder.svg?height=300&width=300",
                description: "Specializes in modern Italian cuisine with 15 years of experience",
              },
              {
                name: "Antonio Bianchi",
                role: "Sous Chef",
                image: "/placeholder.svg?height=300&width=300",
                description: "Expert in traditional pasta making and regional Italian dishes",
              },
              {
                name: "Elena Conti",
                role: "Pastry Chef",
                image: "/placeholder.svg?height=300&width=300",
                description: "Creates artisanal desserts inspired by classic Italian dolci",
              },
              {
                name: "Giuseppe Romano",
                role: "Sommelier",
                image: "/placeholder.svg?height=300&width=300",
                description: "Curates our extensive wine collection from Italian vineyards",
              },
              {
                name: "Maria Lombardi",
                role: "Restaurant Manager",
                image: "/placeholder.svg?height=300&width=300",
                description: "Ensures every guest feels like family with warm hospitality",
              },
              {
                name: "Luca Ferrari",
                role: "Head Server",
                image: "/placeholder.svg?height=300&width=300",
                description: "Provides exceptional service with deep knowledge of our menu",
              },
            ].map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-orange-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">Our Values</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What We Stand For</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our core values guide everything we do, from sourcing ingredients to serving our guests
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[

              {
                icon: Heart,
                title: "Passion",
                description: "Every dish is prepared with love and dedication to culinary excellence",
              },
              {
                icon: Users,
                title: "Family",
                description: "We treat every guest as part of our extended Italian family",
              },
              {
                icon: Award,
                title: "Quality",
                description: "Only the finest ingredients, sourced locally and from Italy",
              },
              {
                icon: Clock,
                title: "Tradition",
                description: "Honoring authentic recipes while embracing culinary innovation",
              },
            ].map((value, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <value.icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Service Excellence Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-softOrange/10 to-vibrantOrange/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-vibrantOrange/20 text-vibrantOrange hover:bg-vibrantOrange/40">Customer Excellence</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Your Satisfaction is Our Priority</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              At Ramen Paradise, exceptional service isn't just a goal—it's our promise. Every interaction is designed to
              exceed your expectations and create memorable moments.
            </p>
          </div>
          {/* Service Promises Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "Personalized Attention",
                description: "Every guest receives individualized care tailored to their preferences and dietary needs",
                promise: "We remember your favorites",
              },
              {
                title: "Swift Response",
                description: "Any concern or request is addressed immediately with urgency and care",
                promise: "2-minute response guarantee",
              },
              {
                title: "Satisfaction Guarantee",
                description: "If you're not completely satisfied, we'll make it right—no questions asked",
                promise: "100% satisfaction or it's on us",
              },
              {
                title: "Special Occasions",
                description: "Birthdays, anniversaries, and celebrations receive extra special treatment",
                promise: "Complimentary celebration touches",
              },
              {
                title: "Continuous Improvement",
                description: "We actively seek and implement feedback to enhance your dining experience",
                promise: "Your voice shapes our service",
              },
              {
                title: "Relationship Building",
                description: "We invest in long-term relationships, treating every guest like family",
                promise: "Personal connections matter",
              },
            ].map((service, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-l-vibrantOrange"
              >
                <CardContent className="space-y-4 p-0">
                  <div className="flex items-center justify-center mb-3">
                    {customerIcons[index]}
                  </div>
                  <h3 className="text-xl font-semibold text-black">{service.title}</h3>
                  <p className="text-gray-700 mb-3">{service.description}</p>
                  <div className="bg-softOrange/20 p-3 rounded-lg">
                    <p className="text-sm font-medium text-vibrantOrange">✓ {service.promise}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant Story Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Our Journey</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">From Dream to Reality</h2>
              <div className="space-y-4 text-gray-600">
                <p className="text-lg">
                  Bella Vista opened its doors in 2018 with a simple dream: to create a place where authentic Italian
                  cuisine meets warm hospitality. What started as a small family restaurant has grown into a beloved
                  community gathering place.
                </p>
                <p className="text-lg">
                  Our commitment to using fresh, locally-sourced ingredients combined with traditional Italian cooking
                  techniques has earned us recognition as one of the city's premier dining destinations.
                </p>
                <p className="text-lg">
                  Today, we're proud to serve over 500 families each week, creating memorable dining experiences that
                  bring people together around the table.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">6+</div>
                  <div className="text-sm text-gray-600">Years Serving</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">50K+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">4.8</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>
            <div>
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="Restaurant Interior"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Bella Vista?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join us for an unforgettable dining experience where every meal is a celebration of Italian culture and
            culinary artistry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              Make a Reservation
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              View Our Menu
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center text-gray-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>123 Italian Way, Foodie District</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>(555) 123-PASTA</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

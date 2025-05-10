import Image from 'next/image';

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[40vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/banners/about-hero-banner.svg"
            alt="Moroccan marketplace"
            fill
            priority
            className="object-cover object-center brightness-75"
          />
        </div>
        <div className="container-custom relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
            About AzniT
          </h1>
        </div>
      </div>

      {/* Our Story */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-primary mb-6 text-center">
              Our Story
            </h2>
            <p className="text-lg mb-6">
              AzniT was born from a love for Moroccan culture and craftsmanship. Our founder, during travels
              through the vibrant souks of Marrakech and the ancient medinas of Fez, was captivated by the
              rich traditions and exceptional quality of Moroccan artisanal products.
            </p>
            <p className="text-lg mb-6">
              Upon returning home, they realized that these beautiful handcrafted treasures were not easily
              accessible to those who appreciated their unique beauty and cultural significance. Thus, AzniT
              was established in 2023 with a mission to bridge this gap and bring authentic Moroccan craftsmanship
              to homes around the world.
            </p>
            <p className="text-lg mb-6">
              The name "AzniT" is inspired by the Amazigh (Berber) word for beauty and craftsmanship, representing
              our commitment to showcasing the exquisite artisanal work that has been perfected over generations
              in Morocco.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="section bg-light">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/images/banners/mission-banner.svg"
                alt="Moroccan artisan working"
                fill
                className="object-cover object-center"
              />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-6">
                Our Mission
              </h2>
              <p className="text-lg mb-6">
                At AzniT, our mission is to preserve and celebrate Moroccan cultural heritage by bringing
                authentic, high-quality products directly from skilled artisans to appreciative customers worldwide.
              </p>
              <p className="text-lg mb-6">
                We are committed to:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-lg mb-6">
                <li>Supporting traditional craftsmanship and ensuring fair compensation for artisans</li>
                <li>Promoting sustainable practices in production and packaging</li>
                <li>Educating our customers about the rich cultural significance behind each product</li>
                <li>Creating a direct bridge between talented craftspeople and global markets</li>
              </ul>
              <p className="text-lg">
                Through these efforts, we aim to ensure that traditional Moroccan crafts continue to thrive
                for generations to come, while allowing people around the world to experience their beauty and quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section">
        <div className="container-custom">
          <h2 className="text-3xl font-serif font-bold text-primary mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Authenticity */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Authenticity</h3>
              <p>
                We guarantee that every product we offer is genuinely handcrafted by skilled Moroccan artisans
                using traditional techniques and authentic materials.
              </p>
            </div>

            {/* Sustainability */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Sustainability</h3>
              <p>
                We prioritize eco-friendly practices throughout our supply chain, from sourcing natural materials
                to using biodegradable packaging whenever possible.
              </p>
            </div>

            {/* Fair Trade */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Fair Trade</h3>
              <p>
                We ensure that the artisans who create our products receive fair compensation for their work,
                supporting their livelihoods and local communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section bg-light">
        <div className="container-custom">
          <h2 className="text-3xl font-serif font-bold text-primary mb-12 text-center">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64 w-full">
                <Image
                  src="/images/team/founder.jpg"
                  alt="Team Member"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Khalid Azeroual</h3>
                <p className="text-primary mb-3">Founder & CEO</p>
                <p className="text-gray-700">
                  With a deep passion for Moroccan culture and heritage, Khalid founded AzniT
                  to share the beauty of Moroccan craftsmanship with the world.
                </p>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64 w-full">
                <Image
                  src="/images/team/creative-director.jpg"
                  alt="Team Member"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Jaouad Haroune</h3>
                <p className="text-primary mb-3">Creative Director</p>
                <p className="text-gray-700">
                  Jaouad brings his expertise in traditional Moroccan design and contemporary
                  aesthetics to curate our beautiful collection of products.
                </p>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64 w-full">
                <Image
                  src="/images/team/artisan-relations.jpg"
                  alt="Team Member"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Said Battou</h3>
                <p className="text-primary mb-3">Artisan Relations</p>
                <p className="text-gray-700">
                  Said works directly with our network of artisans across Morocco,
                  ensuring fair practices and maintaining our quality standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 
import { Target, Users, Globe, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import storyImg from '@assets/generated_images/Carflex_office_story_image_43ba155e.png';

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Customer First",
      description: "Your satisfaction and flexibility are at the heart of everything we do",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Building a community of car enthusiasts who value freedom and choice",
    },
    {
      icon: Globe,
      title: "Sustainability",
      description: "Promoting shared vehicle usage to reduce environmental impact",
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "Constantly evolving our service to meet modern mobility needs",
    },
  ];

  const milestones = [
    { year: "2020", event: "Carflex founded with a vision to revolutionize car ownership" },
    { year: "2021", event: "Launched our first 100 vehicles across major cities" },
    { year: "2023", event: "Expanded to 10,000+ vehicles nationwide" },
    { year: "2024", event: "Introduced luxury and premium vehicle categories" },
    { year: "2025", event: "Serving over 50,000 satisfied subscribers" },
  ];

  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <section className="mb-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-about-title">
              About Carflex
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We're on a mission to make car access flexible, affordable, and hassle-free for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Carflex was born from a simple observation: traditional car ownership doesn't fit 
                  modern lifestyles. Why commit to years of payments when your needs change monthly?
                </p>
                <p>
                  We created Carflex to offer a better way. A subscription service that gives you 
                  the freedom to drive what you want, when you want it, without the long-term commitment 
                  or hassle of traditional ownership.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers who have discovered the joy of 
                  flexible car access. From daily commuters to weekend adventurers, Carflex adapts 
                  to your lifestyle.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src={storyImg}
                alt="Carflex office and team"
                className="aspect-square rounded-lg object-cover w-full shadow-lg"
              />
            </div>
          </div>
        </section>

        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center" data-testid={`card-value-${index}`}>
                <CardHeader>
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-12 text-center">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-1 pt-4">
                    <p className="text-lg">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

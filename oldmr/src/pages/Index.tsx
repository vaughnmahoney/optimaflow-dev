
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { ArrowRight, CheckCircle, ClipboardCheck, Database, ImageIcon, Settings, Shield } from "lucide-react";

export default function Index() {
  return (
    <Layout>
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/20">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Enhance Your OptimoRoute Workflow with OptimaFlow
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Transform your quality control process with advanced analytics, 
              automated billing verification, and comprehensive performance tracking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="text-lg px-8 py-6 hover:scale-105 transition-transform" size="lg">
                Schedule a Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="text-lg px-8 py-6" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Better Together Section */}
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Better Together</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            OptimaFlow seamlessly integrates with OptimoRoute's structured work order check-out process,
            adding powerful quality control and analytics capabilities
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="transition-all duration-300 hover:shadow-lg group">
            <CardHeader>
              <div className="mb-2 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="w-12 h-12 text-primary" />
              </div>
              <CardTitle>Advanced QC Workflow</CardTitle>
              <CardDescription className="text-base">
                Build upon OptimoRoute's check-out system with our enhanced quality control process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <span>AI-powered discrepancy detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <span>Custom QC checklists by location</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg group">
            <CardHeader>
              <div className="mb-2 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-12 h-12 text-primary" />
              </div>
              <CardTitle>Enhanced Visual Verification</CardTitle>
              <CardDescription className="text-base">
                Take OptimoRoute's image capture to the next level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <span>Smart image comparison tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <span>Automated quality scoring</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg group">
            <CardHeader>
              <div className="mb-2 group-hover:scale-110 transition-transform">
                <Database className="w-12 h-12 text-primary" />
              </div>
              <CardTitle>Comprehensive Data Hub</CardTitle>
              <CardDescription className="text-base">
                Centralize all your service data in one powerful platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <span>Historical service tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <span>Advanced analytics dashboard</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg group">
            <CardHeader>
              <div className="mb-2 group-hover:scale-110 transition-transform">
                <Shield className="w-12 h-12 text-primary" />
              </div>
              <CardTitle>Automated Billing Accuracy</CardTitle>
              <CardDescription className="text-base">
                Streamline your billing process with smart verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <span>Real-time pricing validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <span>Automated invoice generation</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg group">
            <CardHeader>
              <div className="mb-2 group-hover:scale-110 transition-transform">
                <Settings className="w-12 h-12 text-primary" />
              </div>
              <CardTitle>Seamless Integration</CardTitle>
              <CardDescription className="text-base">
                Works perfectly with your existing OptimoRoute setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <span>Zero workflow disruption</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <span>Instant data synchronization</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center py-16 bg-gradient-to-br from-primary/5 to-secondary/20 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Optimize Your Quality Control?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join leading service companies who have transformed their operations with OptimaFlow
          </p>
          <Button className="text-lg px-8 py-6 hover:scale-105 transition-transform" size="lg">
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}

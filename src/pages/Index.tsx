
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { CheckCircle, ClipboardCheck, Database, ImageIcon, Settings, Shield } from "lucide-react";

export default function Index() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Meet OptimaFlow: Your New Quality Control Command Center
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Built specifically for Hyland Filter Service's workflow and seamlessly integrated with OptimoRoute
          </p>
          <Button className="text-lg px-8 py-6" size="lg">
            Get Started
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="mb-2">
                <ClipboardCheck className="w-12 h-12 text-primary" />
              </div>
              <CardTitle>Advanced QC Workflow</CardTitle>
              <CardDescription>
                Streamlined quality control process with the new question-based checkout system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Custom form builder for technician responses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Automatic flagging of discrepancies</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="mb-2">
                <ImageIcon className="w-12 h-12 text-primary" />
              </div>
              <CardTitle>Visual Verification</CardTitle>
              <CardDescription>
                Comprehensive image review system for thorough quality control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Before & after image comparison</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Quick image navigation and review</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="mb-2">
                <Database className="w-12 h-12 text-primary" />
              </div>
              <CardTitle>Site Information Hub</CardTitle>
              <CardDescription>
                Centralized location data and site-specific instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Equipment access instructions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Location-specific requirements</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="mb-2">
                <Shield className="w-12 h-12 text-primary" />
              </div>
              <CardTitle>Billing Accuracy</CardTitle>
              <CardDescription>
                Automated verification between work performed and billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Invoice verification system</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Discrepancy flagging</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="mb-2">
                <Settings className="w-12 h-12 text-primary" />
              </div>
              <CardTitle>OptimoRoute Integration</CardTitle>
              <CardDescription>
                Seamless connection with your existing workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Real-time work order sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Enhanced checkout process support</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Quality Control?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Let's streamline your workflow with OptimaFlow
          </p>
          <Button className="text-lg px-8 py-6" size="lg">
            Schedule a Demo
          </Button>
        </div>
      </div>
    </Layout>
  );
}

"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, AlertTriangle, Info, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import type { SecurityScanResult, SecurityIssue } from "@/lib/security/scanner";
import { getSecurityGrade } from "@/lib/security/scanner";

export default function SecurityScanPage() {
  const [scanResult, setScanResult] = React.useState<SecurityScanResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const runScan = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/security/scan");
      if (!response.ok) {
        throw new Error("Failed to run security scan");
      }
      
      const data = await response.json();
      setScanResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    runScan();
  }, []);

  const getSeverityIcon = (severity: SecurityIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getSeverityBadge = (severity: SecurityIssue['severity']) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'secondary',
      info: 'default',
    } as const;
    
    return (
      <Badge variant={variants[severity]} className="capitalize">
        {severity}
      </Badge>
    );
  };

  const getStatusIcon = (status: SecurityIssue['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={runScan} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !scanResult) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Running security scan...</p>
          </div>
        </div>
      </div>
    );
  }

  const grade = getSecurityGrade(scanResult.overallScore);
  const failedIssues = scanResult.issues.filter(i => i.status === 'fail');
  const warningIssues = scanResult.issues.filter(i => i.status === 'warning');
  const passedIssues = scanResult.issues.filter(i => i.status === 'pass');

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Security Scan Report</h1>
            <p className="text-muted-foreground">
              Last scanned: {new Date(scanResult.timestamp).toLocaleString()}
            </p>
          </div>
          <Button onClick={runScan} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Rescan
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card className="mb-6 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Overall Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold">{scanResult.overallScore}</span>
                <span className="text-2xl text-muted-foreground">/100</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={grade.startsWith('A') ? 'default' : grade.startsWith('B') ? 'secondary' : 'destructive'} className="text-lg px-3 py-1">
                  Grade {grade}
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{scanResult.criticalIssues}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">High Issues</p>
                <p className="text-2xl font-bold text-orange-600">{scanResult.highIssues}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Medium Issues</p>
                <p className="text-2xl font-bold text-yellow-600">{scanResult.mediumIssues}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Passed Checks</p>
                <p className="text-2xl font-bold text-green-600">{passedIssues.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Failed Issues */}
      {failedIssues.length > 0 && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Critical Issues Requiring Attention</CardTitle>
            <CardDescription>
              These security vulnerabilities should be addressed immediately
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {failedIssues.map((issue, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{issue.title}</h3>
                      {getSeverityBadge(issue.severity)}
                      {getStatusIcon(issue.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                    <div className="bg-accent rounded-md p-3 mt-2">
                      <p className="text-sm font-medium mb-1">Recommendation:</p>
                      <p className="text-sm text-muted-foreground">{issue.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Warning Issues */}
      {warningIssues.length > 0 && (
        <Card className="mb-6 border-yellow-600">
          <CardHeader>
            <CardTitle className="text-yellow-600">Warnings</CardTitle>
            <CardDescription>
              These items should be reviewed for potential improvements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {warningIssues.map((issue, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{issue.title}</h3>
                      {getSeverityBadge(issue.severity)}
                      {getStatusIcon(issue.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                    <div className="bg-accent rounded-md p-3 mt-2">
                      <p className="text-sm font-medium mb-1">Recommendation:</p>
                      <p className="text-sm text-muted-foreground">{issue.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Passed Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Security Measures In Place</CardTitle>
          <CardDescription>
            These security controls are properly implemented
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {passedIssues.map((issue, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{issue.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{scanResult.totalIssues}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {Math.round((passedIssues.length / scanResult.totalIssues) * 100)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Issues to Fix</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {failedIssues.length + warningIssues.length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
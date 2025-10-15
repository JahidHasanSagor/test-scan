"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Question = {
  id: string;
  question: string;
  options: { id: string; text: string; icon?: string }[];
};

const quizQuestions: Question[] = [
  {
    id: "1",
    question: "What's your primary goal?",
    options: [
      { id: "productivity", text: "Boost Productivity", icon: "⚡" },
      { id: "creativity", text: "Enhance Creativity", icon: "🎨" },
      { id: "marketing", text: "Grow My Business", icon: "📈" },
      { id: "development", text: "Build Software", icon: "💻" },
    ],
  },
  {
    id: "2",
    question: "What's your experience level?",
    options: [
      { id: "beginner", text: "Beginner - Just starting out", icon: "🌱" },
      { id: "intermediate", text: "Intermediate - Some experience", icon: "🚀" },
      { id: "advanced", text: "Advanced - Very experienced", icon: "⭐" },
    ],
  },
  {
    id: "3",
    question: "What's your budget preference?",
    options: [
      { id: "free", text: "Free tools only", icon: "💚" },
      { id: "freemium", text: "Freemium (free with paid upgrades)", icon: "🆓" },
      { id: "paid", text: "Paid tools (best quality)", icon: "💎" },
      { id: "any", text: "Any price range", icon: "💰" },
    ],
  },
  {
    id: "4",
    question: "Which feature is most important?",
    options: [
      { id: "ai-powered", text: "AI-Powered Features", icon: "🤖" },
      { id: "collaboration", text: "Team Collaboration", icon: "👥" },
      { id: "integration", text: "Easy Integrations", icon: "🔗" },
      { id: "simplicity", text: "Simple & Easy to Use", icon: "✨" },
    ],
  },
];

export function ToolFinderQuiz() {
  const [open, setOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = React.useState(false);

  const currentQuestion = quizQuestions[currentStep];
  const isLastQuestion = currentStep === quizQuestions.length - 1;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    
    if (isLastQuestion) {
      // Complete the quiz
      setTimeout(() => {
        setIsComplete(true);
      }, 300);
    } else {
      // Move to next question
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsComplete(false);
  };

  const handleViewResults = () => {
    // Generate personalized recommendations based on answers
    const params = new URLSearchParams();
    Object.entries(answers).forEach(([key, value]) => {
      params.append(key, value);
    });
    
    toast.success("Finding your perfect tools!");
    setOpen(false);
    
    // Navigate to search results with quiz parameters
    window.location.href = `/search?quiz=true&${params.toString()}`;
  };

  const progress = ((currentStep + 1) / quizQuestions.length) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 rounded-full border-2 border-chart-5/30 bg-gradient-to-r from-chart-5/10 to-chart-3/10 hover:from-chart-5/20 hover:to-chart-3/20 transition-all hover:scale-105 shadow-sm"
        >
          <Sparkles className="h-4 w-4 text-chart-5" />
          <span className="hidden sm:inline">Find My Perfect Tool</span>
          <span className="sm:hidden">Tool Finder</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-chart-5" />
            AI Tool Finder
          </DialogTitle>
          <DialogDescription>
            Answer a few quick questions and we'll recommend the perfect tools for you
          </DialogDescription>
        </DialogHeader>

        {!isComplete ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Question {currentStep + 1} of {quizQuestions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-chart-5 to-chart-3"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-foreground">
                  {currentQuestion.question}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = answers[currentQuestion.id] === option.id;
                    
                    return (
                      <Card
                        key={option.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md hover:scale-105",
                          isSelected && "ring-2 ring-chart-5 bg-chart-5/5"
                        )}
                        onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{option.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{option.text}</p>
                            </div>
                            {isSelected && (
                              <Check className="h-5 w-5 text-chart-5 shrink-0" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 py-8 text-center"
          >
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-chart-5 to-chart-3 text-white">
              <Check className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">All Done!</h3>
              <p className="text-muted-foreground">
                We've analyzed your answers and found the perfect tools for you
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={handleViewResults}
                className="gap-2 w-full sm:w-auto"
              >
                View My Recommendations
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="w-full sm:w-auto"
              >
                Retake Quiz
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
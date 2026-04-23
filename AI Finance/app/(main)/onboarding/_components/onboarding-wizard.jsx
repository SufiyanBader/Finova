"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Confetti from "react-confetti";
import {
  Loader2,
  CheckCircle2,
  Building2,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { completeOnboarding } from "@/actions/onboarding";
import useFetch from "@/hooks/use-fetch";

const step1Schema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  accountType: z.enum(["CURRENT", "SAVINGS"]),
  initialBalance: z.string().min(1, "Initial balance is required"),
});

const step2Schema = z.object({
  monthlyBudget: z.string().optional(),
});

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    loading: isLoading,
    fn: completeFn,
    data: result,
  } = useFetch(completeOnboarding);

  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { accountName: "", accountType: "CURRENT", initialBalance: "" },
  });

  const step2Form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: { monthlyBudget: "" },
  });

  useEffect(() => {
    if (result?.success) {
      setShowConfetti(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3500);
    }
  }, [result, router]);

  const onStep1Submit = (data) => {
    setFormData({ ...formData, ...data });
    setStep(2);
  };

  const onStep2Submit = async (data) => {
    const finalData = { ...formData, ...data };
    setFormData(finalData);
    setStep(3);
    await completeFn(finalData);
  };

  const handleSkipStep2 = async () => {
    setStep(3);
    await completeFn(formData);
  };

  const steps = ["Your Account", "Set Budget", "All Done!"];

  return (
    <div className="w-full max-w-md mx-auto">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
      
      <div className="mb-8 flex justify-between items-center relative">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10 transform -translate-y-1/2 rounded-full" />
        <div
          className="absolute left-0 top-1/2 h-1 bg-emerald-600 -z-10 transform -translate-y-1/2 transition-all duration-300 rounded-full"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        />
        {steps.map((label, index) => {
          const isActive = index + 1 === step;
          const isCompleted = index + 1 < step;
          return (
            <div key={label} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                  isActive
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-white dark:bg-gray-800 border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
              </div>
              <span className="text-xs mt-2 font-medium bg-transparent">{label}</span>
            </div>
          );
        })}
      </div>

      <div className="min-h-[400px]">
        {step === 1 && (
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Building2 className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Create Your First Account</CardTitle>
              <CardDescription>
                Add an account to start tracking your finances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input placeholder="e.g., Main Checking" {...step1Form.register("accountName")} />
                  {step1Form.formState.errors.accountName && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.accountName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Select
                    onValueChange={(val) => step1Form.setValue("accountType", val)}
                    defaultValue="CURRENT"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CURRENT">Current (Checking)</SelectItem>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Initial Balance ($)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" {...step1Form.register("initialBalance")} />
                  {step1Form.formState.errors.initialBalance && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.initialBalance.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full mt-6" size="lg">
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur animate-in fade-in slide-in-from-right-4">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle className="text-2xl">Set a Monthly Budget</CardTitle>
              <CardDescription>
                Optional - you can set this later
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Monthly Budget ($)</Label>
                  <Input type="number" step="0.01" placeholder="e.g., 2000.00" {...step2Form.register("monthlyBudget")} />
                </div>

                <div className="flex gap-4 mt-6">
                  <Button type="button" variant="outline" className="w-full" onClick={handleSkipStep2}>
                    Skip
                  </Button>
                  <Button type="submit" className="w-full" size="lg">
                    Continue
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur animate-in zoom-in-95">
            <CardContent className="flex flex-col items-center justify-center text-center py-12 px-6">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse relative z-10">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-3xl mb-2 gradient-title">You&apos;re all set!</CardTitle>
              <CardDescription className="text-base mb-8">
                Your account has been created. Redirecting you to your dashboard...
              </CardDescription>

              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving setup...
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

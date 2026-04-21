"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Target, Trash2, Plus, Calendar, CheckCircle2 } from "lucide-react";
import { deleteGoal, updateGoalProgress } from "@/actions/goals";
import useFetch from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useCurrency } from "@/components/currency-provider";

export default function GoalCard({ goal, accounts: _accounts }) {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const { formatCurrency } = useCurrency();

  const {
    loading: deleteLoading,
    fn: deleteFn,
  } = useFetch(deleteGoal);

  const {
    loading: updateLoading,
    fn: updateFn,
    data: updateResult,
    error,
  } = useFetch(updateGoalProgress);

  const percentComplete = Math.min(
    (goal.savedAmount / goal.targetAmount) * 100,
    100
  ).toFixed(1);

  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);

  const daysLeft = goal.deadline
    ? Math.ceil(
        (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const handleAddFunds = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    await updateFn(goal.id, parseFloat(addAmount));
  };

  const handleDelete = () => {
    if (window.confirm("Delete this goal?")) {
      deleteFn(goal.id);
    }
  };

  useEffect(() => {
    if (updateResult?.success && !updateLoading) {
      toast.success("Progress updated");
      setAddAmount("");
      setShowAddFunds(false);
    }
  }, [updateResult, updateLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const progressColor =
    parseFloat(percentComplete) >= 100
      ? "[&>div]:bg-green-500"
      : parseFloat(percentComplete) >= 75
      ? "[&>div]:bg-emerald-500"
      : parseFloat(percentComplete) >= 50
      ? "[&>div]:bg-yellow-500"
      : "[&>div]:bg-red-400";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-base">{goal.name}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {goal.isCompleted && (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive/90"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {formatCurrency(goal.savedAmount)} of {formatCurrency(goal.targetAmount)}
            </span>
          </div>
          <Progress value={parseFloat(percentComplete)} className={progressColor} />
          <p className="text-right text-xs text-muted-foreground mt-1">
            {percentComplete}% complete
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            <p className="text-muted-foreground text-xs">Remaining</p>
            <p className="font-semibold">{formatCurrency(remaining)}</p>
          </div>
          
          {daysLeft !== null && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
              <p className="text-muted-foreground text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Days Left
              </p>
              <p
                className={`font-semibold ${
                  daysLeft < 7 ? "text-red-600" : "text-foreground"
                }`}
              >
                {daysLeft > 0 ? `${daysLeft} days` : "Overdue"}
              </p>
            </div>
          )}
        </div>

        {showAddFunds ? (
          <div className="space-y-2 mt-4">
            <Label>Add Funds</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
              />
              <Button size="sm" onClick={handleAddFunds} disabled={updateLoading}>
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddFunds(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          !goal.isCompleted && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setShowAddFunds(true)}
              disabled={updateLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}

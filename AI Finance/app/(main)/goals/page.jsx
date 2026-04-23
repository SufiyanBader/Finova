export const dynamic = "force-dynamic";

import { getGoals } from "@/actions/goals";
import { getUserAccounts } from "@/actions/dashboard";
import { Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CreateGoalDialog from "./_components/create-goal-dialog";
import GoalCard from "./_components/goal-card";

export default async function GoalsPage() {
  const goals = await getGoals();
  const accounts = await getUserAccounts();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-5xl gradient-title">Financial Goals</h1>
        <CreateGoalDialog accounts={accounts} />
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="font-medium text-lg mb-1">No goals yet</p>
            <p className="text-muted-foreground text-sm">
              Create your first financial goal to start tracking your progress
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} accounts={accounts} />
          ))}
        </div>
      )}
    </div>
  );
}

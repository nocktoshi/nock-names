import { useState, useEffect } from "react";
import { Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchRecent } from "@/api";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import { getFee } from "@/common";

export default function RecentlyRegistered({ limit = 9 }) {
  const [recentRegistrations, setRecentRegistrations] = useState([]);

  useEffect(() => {
    fetchRecent().then((data) => {
      const sortedData = data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setRecentRegistrations(sortedData.slice(0, limit));
    });
  }, [limit]);

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Recently Registered
          <Badge
            variant="secondary"
            className="ml-2 bg-chart-2/20 text-chart-2"
          >
            Live Activity
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          See what domains others have registered recently for inspiration
        </p>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentRegistrations.map((registration) => (
            <Card
              key={registration.id}
              data-testid={`card-recent-domain-${registration.name}`}
              className="hover-elevate border glassmorphism"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4
                    className="font-mono font-semibold text-sm truncate"
                    data-testid={`text-recent-domain-${registration.name}`}
                  >
                    {registration.name}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    Registered
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-mono font-medium">
                      {getFee(registration.name)} NOCK
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Owner</span>
                    <span
                      className="font-mono truncate max-w-20"
                      title={registration.address || ""}
                    >
                      {registration.address?.slice(0, 4)}...
                      {registration.address?.slice(-4)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 pt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {dayjs(registration.timestamp).fromNow()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Activity updates in real-time as domains are registered on the
            blockchain
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

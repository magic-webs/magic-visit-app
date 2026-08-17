import { Card } from "@/components/ui/Card";
import { AvailabilityToggle } from "@/components/salesperson/AvailabilityToggle";
import { ProfileScreenContent } from "@/components/profile/ProfileScreenContent";

export default function SalespersonProfileScreen() {
  return (
    <ProfileScreenContent
      extraRows={
        <Card>
          <AvailabilityToggle />
        </Card>
      }
    />
  );
}

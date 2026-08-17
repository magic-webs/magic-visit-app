import { useState, useEffect } from "react";
import { Pressable, View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Mars, Venus, Blend, ChevronLeft } from "lucide-react-native";
import { id } from "@instantdb/react-native";
import LottieView from "lottie-react-native";
import { useAudioPlayer } from "expo-audio";
import { db } from "@/lib/db";
import { sendNotification } from "@/lib/auth-bridge";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { DateField } from "@/components/ui/DateField";
import { SwitchRow } from "@/components/ui/SwitchRow";
import { SalespersonPicker } from "@/components/visitors/SalespersonPicker";
import { StepIndicator } from "@/components/visitors/StepIndicator";
import { Avatar } from "@/components/identity/Avatar";
import { useSession } from "@/contexts/SessionContext";
import { theme } from "@/constants/theme";

type Stage = "search" | "found" | "register" | "created";

const TOTAL_STEPS = 4;

const GENDER_OPTIONS = [
  { value: "male" as const, label: "Male", Icon: Mars },
  { value: "female" as const, label: "Female", Icon: Venus },
  { value: "other" as const, label: "Other", Icon: Blend },
];

const HANDM_OPTIONS = [
  { value: "H", label: "H" },
  { value: "M", label: "M" },
  { value: "other", label: "O" },
];

export default function AddVisitorScreen() {
  const session = useSession();
  const [stage, setStage] = useState<Stage>("search");
  const [wizardStep, setWizardStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [searching, setSearching] = useState(false);
  const [customer, setCustomer] = useState<any | null>(null);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState<Date | undefined>();
  const [doa, setDoa] = useState<Date | undefined>();
  const [gender, setGender] = useState<"male" | "female" | "other" | undefined>();
  const [hAndM, setHAndM] = useState<string | undefined>();

  const [salespersonId, setSalespersonId] = useState<string | undefined>();
  const [followUpOn, setFollowUpOn] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();
  const [followUpRemark, setFollowUpRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [stepError, setStepError] = useState<string | undefined>();

  const player = useAudioPlayer(require("@/assets/success.mp3"));

  useEffect(() => {
    if (stage === "created" && player) {
      player.seekTo(0);
      player.play();
    }
  }, [stage, player]);

  async function handleSearch() {
    setError(undefined);
    const normalized = mobile.replace(/\D/g, "");
    if (normalized.length < 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setSearching(true);
    try {
      const { data } = await (db.queryOnce as any)({
        customers: {
          $: { where: { mobile: normalized } },
          // `limit`/`offset` etc. only work on top-level namespaces, not
          // nested relations — order here, then take the first 5 client-side.
          visitorLogs: { $: { order: { visitedAt: "desc" } } },
        },
      });
      const found = (data as any)?.customers?.[0];
      if (found) {
        setCustomer(found);
        setRecentVisits((found.visitorLogs ?? []).slice(0, 5));
        setStage("found");
      } else {
        setWizardStep(1);
        setStage("register");
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function createLogForCustomer(customerId: string, branchId: string, customerName: string) {
    const { data: serialData } = await (db.queryOnce as any)({
      visitorLogs: {
        $: {
          where: { "branch.id": branchId, visitedAt: { $gte: new Date().setHours(0, 0, 0, 0) } },
          order: { serialNumber: "desc" },
          limit: 1,
        },
      },
    });
    const lastSerial = (serialData as any)?.visitorLogs?.[0]?.serialNumber ?? 0;

    const logId = id();
    const chunks: any[] = [
      db.tx.visitorLogs[logId]
        .update({
          status: followUpOn ? "follow_up" : "none",
          assignmentStatus: salespersonId ? "pending_acceptance" : "unassigned",
          serialNumber: lastSerial + 1,
          visitedAt: Date.now(),
          ...(followUpOn && followUpDate && { followUpDate: followUpDate.toISOString() }),
        })
        .link({ customer: customerId, branch: branchId, receptionist: session.profileId! }),
    ];
    if (salespersonId) chunks.push(db.tx.visitorLogs[logId].link({ salesperson: salespersonId }));
    if (followUpOn && followUpRemark.trim()) {
      const remarkId = id();
      chunks.push(
        db.tx.salesRemarks[remarkId]
          .update({ remark: followUpRemark.trim(), createdAt: Date.now() })
          .link({ visitorLog: logId, author: session.profileId! }),
      );
    }
    await db.transact(chunks);

    if (salespersonId) {
      sendNotification({
        toProfileIds: [salespersonId],
        title: "New visitor assigned",
        body: `${customerName} has been assigned to you.`,
        data: { type: "visitor_assigned", logId },
      }).catch(() => { });
    }
  }

  async function handleCreateLogForFound() {
    if (!customer || !session.branchId) return;
    setError(undefined);
    setSubmitting(true);
    try {
      await createLogForCustomer(customer.id, session.branchId, customer.name);
      setStage("created");
    } catch {
      setError("Couldn't create the visitor log. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function goNextStep() {
    setStepError(undefined);
    if (wizardStep === 1 && !name.trim()) {
      setStepError("Name is required.");
      return;
    }
    setWizardStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function goPrevStep() {
    setStepError(undefined);
    setWizardStep((s) => Math.max(1, s - 1));
  }

  async function handleRegister() {
    if (!session.branchId) return;
    if (!name.trim()) {
      setWizardStep(1);
      setStepError("Name is required.");
      return;
    }
    setError(undefined);
    setSubmitting(true);
    try {
      const normalized = mobile.replace(/\D/g, "");
      const customerId = id();
      await db.transact([
        db.tx.customers[customerId]
          .update({
            name: name.trim(),
            mobile: normalized,
            type: "visitor",
            ...(email.trim() && { email: email.trim() }),
            ...(dob && { dob: dob.toISOString() }),
            ...(doa && { doa: doa.toISOString() }),
            ...(gender && { gender }),
            ...(hAndM && { hAndM }),
          })
          .link({ branch: session.branchId }),
      ]);
      await createLogForCustomer(customerId, session.branchId, name.trim());
      setStage("created");
    } catch {
      setError("Couldn't register the visitor. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStage("search");
    setWizardStep(1);
    setMobile("");
    setCustomer(null);
    setRecentVisits([]);
    setName("");
    setEmail("");
    setDob(undefined);
    setDoa(undefined);
    setGender(undefined);
    setHAndM(undefined);
    setSalespersonId(undefined);
    setFollowUpOn(false);
    setFollowUpDate(undefined);
    setFollowUpRemark("");
    setError(undefined);
    setStepError(undefined);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-brand-gold-50">
      <ScrollView contentContainerClassName="gap-4 p-4" keyboardShouldPersistTaps="handled">
        {stage === "created" ? (
          <Card className="items-center gap-3 py-6">
            <View className="h-44 w-full items-center justify-center relative overflow-hidden">
              <LottieView
                source={require("@/assets/lottie-animations/success.json")}
                autoPlay
                loop={false}
                style={{ width: 140, height: 140 }}
              />
            </View>
            <AppText className="font-sans-semibold text-lg text-[#1c1c1e] text-center">Visitor Log Created!</AppText>
            <Button className="mt-2 w-4/5" onPress={reset}>
              Add Another Visitor
            </Button>
          </Card>
        ) : (
          <>
            {stage === "search" ? (
              <Card className="gap-3">
                <AppText className="font-sans-semibold text-sm text-[#1c1c1e]">Search by mobile number</AppText>
                <TextField
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                <Button onPress={handleSearch} loading={searching}>
                  Search
                </Button>
                {error && <AppText className="font-sans text-sm text-status-notInterested">{error}</AppText>}
              </Card>
            ) : (
              <Pressable onPress={reset} className="flex-row items-center gap-1 self-start">
                <ChevronLeft size={18} color={theme.teal.DEFAULT} />
                <AppText className="font-sans-medium text-sm text-brand-teal">Back to search</AppText>
              </Pressable>
            )}

            {stage === "found" && customer && (
              <Card className="gap-3 border border-status-sold/30">
                <View className="flex-row items-center gap-3">
                  <Avatar name={customer.name} size="lg" />
                  <View className="flex-1">
                    <AppText className="font-sans-semibold text-base text-[#1c1c1e]">{customer.name}</AppText>
                    <AppText className="font-sans text-sm text-[#6b7280]">{customer.mobile}</AppText>
                    <AppText className="font-sans text-xs text-[#9ca3af]">{recentVisits.length} recent visit(s)</AppText>
                  </View>
                </View>

                <SalespersonPicker value={salespersonId} onChange={setSalespersonId} branchId={session.branchId} />

                <SwitchRow
                  label="Schedule Follow Up?"
                  value={followUpOn}
                  onValueChange={(v) => {
                    setFollowUpOn(v);
                    if (v && !followUpDate) setFollowUpDate(new Date());
                  }}
                />
                {followUpOn && (
                  <>
                    <DateField label="Follow-up Date" value={followUpDate} onChange={setFollowUpDate} />
                    <TextField
                      label="Follow-up Remark"
                      placeholder="What should the salesperson know?"
                      value={followUpRemark}
                      onChangeText={setFollowUpRemark}
                    />
                  </>
                )}

                <Button onPress={handleCreateLogForFound} loading={submitting}>
                  Create Visitor Log
                </Button>
              </Card>
            )}

            {stage === "register" && (
              <Card className="gap-5">
                <View className="gap-3">
                  <AppText className="font-sans-semibold text-sm text-[#1c1c1e]">New Customer — Register</AppText>
                  <StepIndicator current={wizardStep} total={TOTAL_STEPS} />
                </View>

                {wizardStep === 1 && (
                  <View className="gap-4">
                    <AppText className="font-sans-medium text-xs text-[#9ca3af]">STEP 1 OF 4 · PERSONAL DETAILS</AppText>
                    <TextField label="Name" placeholder="Full name" value={name} onChangeText={setName} />
                    <TextField
                      label="Email (optional)"
                      placeholder="Email address"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                    />
                  </View>
                )}

                {wizardStep === 2 && (
                  <View className="gap-4">
                    <AppText className="font-sans-medium text-xs text-[#9ca3af]">STEP 2 OF 4 · IMPORTANT DATES</AppText>
                    <DateField label="Date of Birth" value={dob} onChange={setDob} />
                    <DateField label="Anniversary" value={doa} onChange={setDoa} />
                  </View>
                )}

                {wizardStep === 3 && (
                  <View className="gap-4">
                    <AppText className="font-sans-medium text-xs text-[#9ca3af]">STEP 3 OF 4 · PROFILE</AppText>
                    <View className="gap-1.5">
                      <AppText className="font-sans-medium text-sm text-[#4b5563]">Gender</AppText>
                      <View className="flex-row gap-2">
                        {GENDER_OPTIONS.map(({ value, label, Icon }) => {
                          const isActive = gender === value;
                          return (
                            <Button
                              key={value}
                              variant={isActive ? "primary" : "outline"}
                              className="flex-1"
                              icon={Icon}
                              onPress={() => setGender(value)}
                            >
                              {label}
                            </Button>
                          );
                        })}
                      </View>
                    </View>
                    <View className="gap-1.5">
                      <AppText className="font-sans-medium text-sm text-[#4b5563]">H&M</AppText>
                      <ChipGroup options={HANDM_OPTIONS} value={hAndM} onChange={setHAndM} />
                    </View>
                  </View>
                )}

                {wizardStep === 4 && (
                  <View className="gap-4">
                    <AppText className="font-sans-medium text-xs text-[#9ca3af]">STEP 4 OF 4 · ASSIGN &amp; CONFIRM</AppText>
                    <SalespersonPicker value={salespersonId} onChange={setSalespersonId} branchId={session.branchId} />

                    <View className="gap-2 rounded-2xl bg-brand-gold-50 p-3">
                      <AppText className="font-sans-medium text-xs text-[#9ca3af]">Summary</AppText>
                      <View className="flex-row flex-wrap gap-2">
                        <SummaryChip label={name || "—"} />
                        {!!email.trim() && <SummaryChip label={email.trim()} />}
                        {dob && <SummaryChip label={`DOB: ${dob.toLocaleDateString("en-IN")}`} />}
                        {doa && <SummaryChip label={`Anniv: ${doa.toLocaleDateString("en-IN")}`} />}
                        {gender && <SummaryChip label={gender} />}
                        {hAndM && <SummaryChip label={hAndM} />}
                      </View>
                    </View>
                  </View>
                )}

                {stepError && <AppText className="font-sans text-sm text-status-notInterested">{stepError}</AppText>}
                {error && <AppText className="font-sans text-sm text-status-notInterested">{error}</AppText>}

                <View className="flex-row gap-2">
                  {wizardStep > 1 && (
                    <Button variant="outline" className="flex-1" onPress={goPrevStep}>
                      Back
                    </Button>
                  )}
                  {wizardStep < TOTAL_STEPS ? (
                    <Button className="flex-1" onPress={goNextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button className="flex-1" onPress={handleRegister} loading={submitting}>
                      Register
                    </Button>
                  )}
                </View>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      {stage === "created" && (
        <View
          pointerEvents="none"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
        >
          <LottieView
            source={require("@/assets/lottie-animations/coffeti.json")}
            autoPlay
            loop={false}
            style={{ flex: 1 }}
            resizeMode="cover"
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function SummaryChip({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-white px-3 py-1.5">
      <AppText className="font-sans-medium text-xs text-[#1c1c1e]">{label}</AppText>
    </View>
  );
}

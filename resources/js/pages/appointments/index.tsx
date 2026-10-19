import { Head, Link } from '@inertiajs/react';
import { BellRing, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Appointment } from '@/types/clinic';

interface Props {
    appointments: Appointment[];
}

function formatWhen(value: string): string {
    return new Date(value).toLocaleString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function AppointmentsIndex({ appointments }: Props) {
    return (
        <>
            <Head title="My Appointments" />
            <div className="mx-auto w-full max-w-2xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">My Appointments</h1>
                    <Button asChild>
                        <Link href="/assistant">Book another</Link>
                    </Button>
                </div>

                {appointments.length === 0 ? (
                <div className="space-y-3 rounded-xl border border-sidebar-border/70 py-12 text-center dark:border-sidebar-border">
                    <CalendarDays className="mx-auto size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">You have no appointments yet.</p>
                    <Button asChild variant="outline">
                        <Link href="/assistant">Talk to the assistant</Link>
                    </Button>
                </div>
            

              ) : (  <ul className="space-y-3">
                {appointments.map((appointment) => (
                    <li
                        key={appointment.id}
                        className="flex items-center justify-between rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
                    >
                        <div className="space-y-1">
                            <p className="font-medium">{appointment.doctor.name}</p>
                            <p className="text-sm text-muted-foreground">{appointment.doctor.specialty}</p>
                            <p className="text-sm">{formatWhen(appointment.scheduled_at)}</p>
                            {appointment.reason && <p className="text-sm text-muted-foreground">Reason: {appointment.reason}</p>}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary" className="capitalize">
                                {appointment.status}
                            </Badge>
                            {appointment.reminder_opt_in && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <BellRing className="size-3" /> Reminder on
                                </span>
                            )}
                        </div>

                    </li>
                ))}
            </ul>
              )}
            </div>
        </>
    );
}

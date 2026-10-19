import { Head, Link } from '@inertiajs/react';

import {
    CalendarDays,
    Clock,
    CheckCircle2,
    Stethoscope,
    ArrowRight,
} from 'lucide-react';

interface DashboardStats {
    todayAppointments: number;
    upcomingAppointments: number;
    totalDoctors?: number;
    pendingReminders: number;
    totalAppointments?: number;
}

interface Doctor {
    id: number;
    name: string;
}

interface Appointment {
    id: number;
    doctor_id: number;
    patient_name: string;
    patient_email: string;
    scheduled_at: string;
    status: string;
    doctor?: Doctor;
}

interface Props {
    role: 'admin' | 'user';
    stats: DashboardStats;
    appointments: Appointment[];
}

export default function Dashboard({
    role,
    stats,
    appointments,
}: Props) {
    const isAdmin = role === 'admin';

    return (
        <>
            <Head
                title={isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
            />

            <div className="space-y-6 p-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold">
                        {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        {isAdmin
                            ? 'Overview of the doctor appointment system.'
                            : 'Overview of your appointments and reminders.'}
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                    {/* Today's Appointments */}
                    <StatCard
                        title="Today's Appointments"
                        value={stats.todayAppointments}
                        icon={
                            <CalendarDays className="size-5" />
                        }
                    />

                    {/* Upcoming Appointments */}
                    <StatCard
                        title="Upcoming Appointments"
                        value={stats.upcomingAppointments}
                        icon={
                            <Clock className="size-5" />
                        }
                    />

                    {/* Admin: Total Doctors */}
                    {/* User: My Appointments */}
                    {isAdmin ? (
                        <StatCard
                            title="Total Doctors"
                            value={stats.totalDoctors ?? 0}
                            icon={
                                <Stethoscope className="size-5" />
                            }
                        />
                    ) : (
                        <StatCard
                            title="My Appointments"
                            value={stats.totalAppointments ?? 0}
                            icon={
                                <CalendarDays className="size-5" />
                            }
                        />
                    )}

                    {/* Pending Reminders */}
                    <StatCard
                        title="Pending Reminders"
                        value={stats.pendingReminders}
                        icon={
                            <CheckCircle2 className="size-5" />
                        }
                    />
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Appointments */}
                    <div className="rounded-xl border bg-card p-5 lg:col-span-2">

                        {/* Section Header */}
                        <div className="mb-4 flex items-center justify-between">

                            <div>
                                <h2 className="font-semibold">
                                    {isAdmin
                                        ? 'Upcoming Appointments'
                                        : 'My Upcoming Appointments'}
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    {isAdmin
                                        ? 'Upcoming appointments in the system.'
                                        : 'Your next scheduled appointments.'}
                                </p>
                            </div>

                            <Link
                                href="/appointments"
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                                View all
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>

                        {/* Appointment List */}
                        <div className="space-y-3">

                            {appointments.length === 0 ? (
                                <div className="py-10 text-center">

                                    <CalendarDays className="mx-auto mb-3 size-8 text-muted-foreground" />

                                    <p className="text-sm text-muted-foreground">
                                        {isAdmin
                                            ? 'No upcoming appointments.'
                                            : 'You have no upcoming appointments.'}
                                    </p>

                                    {!isAdmin && (
                                        <Link
                                            href="/assistant"
                                            className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                        >
                                            Book an appointment
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    )}

                                </div>
                            ) : (
                                appointments.map((appointment) => (
                                    <AppointmentRow
                                        key={appointment.id}
                                        appointment={appointment}
                                        isAdmin={isAdmin}
                                    />
                                ))
                            )}

                        </div>
                    </div>

                    {/* Quick Overview */}
                    <div className="rounded-xl border bg-card p-5">

                        <h2 className="font-semibold">
                            {isAdmin
                                ? 'System Overview'
                                : 'My Overview'}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {isAdmin
                                ? 'Current system statistics.'
                                : 'Your appointment statistics.'}
                        </p>

                        <div className="mt-6 space-y-5">

                            <OverviewRow
                                label="Today's appointments"
                                value={stats.todayAppointments}
                            />

                            <OverviewRow
                                label="Upcoming appointments"
                                value={stats.upcomingAppointments}
                            />

                            {isAdmin ? (
                                <OverviewRow
                                    label="Total doctors"
                                    value={stats.totalDoctors ?? 0}
                                />
                            ) : (
                                <OverviewRow
                                    label="My appointments"
                                    value={stats.totalAppointments ?? 0}
                                />
                            )}

                            <OverviewRow
                                label="Pending reminders"
                                value={stats.pendingReminders}
                            />

                        </div>
                    </div>
                </div>

                {/* Quick Actions - User */}
                {!isAdmin && (
                    <div className="rounded-xl border bg-card p-5">

                        <h2 className="font-semibold">
                            Quick Actions
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Quickly access your appointment features.
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">

                            <Link
                                href="/assistant"
                                className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted"
                            >
                                <div className="flex items-center gap-3">

                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Stethoscope className="size-5" />
                                    </div>

                                    <div>
                                        <p className="font-medium">
                                            Book Appointment
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            Find a doctor and book a time.
                                        </p>
                                    </div>

                                </div>

                                <ArrowRight className="size-4" />
                            </Link>

                            <Link
                                href="/appointments"
                                className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted"
                            >
                                <div className="flex items-center gap-3">

                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <CalendarDays className="size-5" />
                                    </div>

                                    <div>
                                        <p className="font-medium">
                                            My Appointments
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            View your appointment history.
                                        </p>
                                    </div>

                                </div>

                                <ArrowRight className="size-4" />
                            </Link>

                        </div>
                    </div>
                )}

                {/* Admin Quick Actions */}
                {isAdmin && (
                    <div className="rounded-xl border bg-card p-5">

                        <h2 className="font-semibold">
                            Quick Actions
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage your appointment system.
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">

                            <Link
                                href="/admin/doctors"
                                className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted"
                            >
                                <div className="flex items-center gap-3">

                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Stethoscope className="size-5" />
                                    </div>

                                    <div>
                                        <p className="font-medium">
                                            Manage Doctors
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            Add and manage doctors.
                                        </p>
                                    </div>

                                </div>

                                <ArrowRight className="size-4" />
                            </Link>

                            <Link
                                href="/appointments"
                                className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted"
                            >
                                <div className="flex items-center gap-3">

                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <CalendarDays className="size-5" />
                                    </div>

                                    <div>
                                        <p className="font-medium">
                                            Appointments
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            View scheduled appointments.
                                        </p>
                                    </div>

                                </div>

                                <ArrowRight className="size-4" />
                            </Link>

                        </div>
                    </div>
                )}

            </div>
        </>
    );
}


/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

function StatCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border bg-card p-5">

            <div className="flex items-center justify-between">

                <p className="text-sm text-muted-foreground">
                    {title}
                </p>

                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    {icon}
                </div>

            </div>

            <p className="mt-3 text-3xl font-bold">
                {value}
            </p>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Appointment Row
|--------------------------------------------------------------------------
*/

function AppointmentRow({
    appointment,
    isAdmin,
}: {
    appointment: Appointment;
    isAdmin: boolean;
}) {
    const date = new Date(appointment.scheduled_at);

    return (
        <div className="flex items-center justify-between rounded-lg border p-4">

            {/* Doctor / Patient */}
            <div className="flex items-center gap-3">

                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Stethoscope className="size-5" />
                </div>

                <div>

                    <p className="font-medium">
                        {appointment.doctor?.name ?? 'Doctor'}
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {isAdmin
                            ? appointment.patient_name
                            : `Patient: ${appointment.patient_name}`}
                    </p>

                </div>

            </div>

            {/* Date / Time */}
            <div className="text-right">

                <p className="text-sm font-medium">
                    {date.toLocaleDateString()}
                </p>

                <p className="text-xs text-muted-foreground">
                    {date.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>

            </div>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Overview Row
|--------------------------------------------------------------------------
*/

function OverviewRow({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="flex items-center justify-between">

            <span className="text-sm text-muted-foreground">
                {label}
            </span>

            <span className="font-semibold">
                {value}
            </span>

        </div>
    );
}
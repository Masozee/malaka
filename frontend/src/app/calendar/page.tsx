'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TwoLevelLayout } from '@/components/ui/two-level-layout';
import { Header } from '@/components/ui/header';
import { EventForm, EventFormData } from '@/components/forms/event-form';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { calendarService, CalendarEvent } from '@/services/calendar';
import { authService } from '@/services/auth';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Demo data for when backend is not available
const getDemoEvents = (): CalendarEvent[] => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return [
    {
      id: 'demo-1',
      title: 'Team Meeting',
      date: new Date(currentYear, currentMonth, 15, 10, 0),
      endDate: new Date(currentYear, currentMonth, 15, 11, 0),
      type: 'meeting',
      priority: 'high',
      location: 'Conference Room A',
      description: 'Weekly team sync meeting',
      isAllDay: false,
      attendees: []
    },
    {
      id: 'demo-2',
      title: 'Project Deadline',
      date: new Date(currentYear, currentMonth, 25, 17, 0),
      type: 'task',
      priority: 'high',
      location: '',
      description: 'Final submission of calendar integration project',
      isAllDay: true,
      attendees: []
    },
    {
      id: 'demo-3',
      title: 'Doctor Appointment',
      date: new Date(currentYear, currentMonth, 20, 14, 30),
      endDate: new Date(currentYear, currentMonth, 20, 15, 30),
      type: 'reminder',
      priority: 'medium',
      location: 'Medical Center',
      description: 'Annual health checkup',
      isAllDay: false,
      attendees: []
    }
  ];
};

const getDemoHolidays = (): CalendarEvent[] => {
  const currentYear = new Date().getFullYear();

  return [
    {
      id: 'holiday-1',
      title: 'Independence Day',
      date: new Date(currentYear, 7, 17), // August 17
      type: 'holiday',
      priority: 'low',
      location: '',
      description: 'Indonesian Independence Day',
      isAllDay: true,
      attendees: []
    }
  ];
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [holidays, setHolidays] = useState<CalendarEvent[]>([]);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = new Date(currentYear, currentMonth - 1, 1);
  const nextMonth = new Date(currentYear, currentMonth + 1, 1);

  // Initialize authentication and fetch calendar data
  useEffect(() => {
    const initializeAndFetch = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize authentication
        authService.initializeAuth();

        // Auto-login for development
        const isAuthenticated = await authService.autoLogin();
        if (!isAuthenticated) {
          // Authentication failed, using demo data
          console.log('Authentication failed, using demo data');
          setEvents(getDemoEvents());
          setHolidays(getDemoHolidays());
          setError('Backend authentication failed. Using demo data.');
          return;
        }

        console.log('Authentication successful, fetching data from backend...');

        try {
          // Fetch holidays for current year (use 2024 data as that's what's in database)
          const yearHolidays = await calendarService.getHolidays(2024);
          setHolidays(yearHolidays);
          console.log('Successfully fetched holidays:', yearHolidays);

          // Fetch events for current month
          const monthEvents = await calendarService.getCalendarEvents(currentYear, currentMonth + 1);
          setEvents(monthEvents);
          console.log('Successfully fetched events:', monthEvents);

        } catch (apiError) {
          // API call failed, using demo data
          console.error('API call failed:', apiError);
          setEvents(getDemoEvents());
          setHolidays(getDemoHolidays());
          setError('API call failed. Using demo data.');
        }

      } catch (err) {
        // Failed to initialize calendar
        console.error('Calendar initialization failed:', err);
        setError('Calendar initialization failed. Using demo data.');
        // Use demo data as fallback
        setEvents(getDemoEvents());
        setHolidays(getDemoHolidays());
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetch();
  }, [currentYear, currentMonth]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    if (viewMode === 'month') {
      if (direction === 'prev') {
        newDate.setMonth(currentMonth - 1);
      } else {
        newDate.setMonth(currentMonth + 1);
      }
    } else if (viewMode === 'week') {
      if (direction === 'prev') {
        newDate.setDate(currentDate.getDate() - 7);
      } else {
        newDate.setDate(currentDate.getDate() + 7);
      }
    } else if (viewMode === 'day') {
      if (direction === 'prev') {
        newDate.setDate(currentDate.getDate() - 1);
      } else {
        newDate.setDate(currentDate.getDate() + 1);
      }
    }

    setCurrentDate(newDate);
  };

  const getViewTitle = () => {
    if (viewMode === 'month') {
      return `${months[currentMonth]} ${currentYear}`;
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${months[startOfWeek.getMonth()]} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      } else {
        return `${months[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${months[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      }
    } else if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      return 'Upcoming Events';
    }
  };

  const handleAddEvent = (date?: Date) => {
    setSelectedDate(date);
    setSelectedEvent(undefined); // Clear any existing event for new event creation
    setEventFormOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(event.date);
    setEventFormOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await calendarService.deleteEvent(eventId);

      // Remove event from local state
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setHolidays(prev => prev.filter(e => e.id !== eventId));

    } catch (err) {
      // Failed to delete event
      setError('Failed to delete event');
    }
  };

  const handleEventSubmit = async (eventData: EventFormData) => {
    try {
      if (selectedEvent) {
        // Update existing event
        const updateRequest = calendarService.transformFormDataToUpdateRequest(eventData);
        const updatedEvent = await calendarService.updateEvent(selectedEvent.id, updateRequest);
        const calendarEvent = calendarService.transformToCalendarEvent(updatedEvent);

        // Update local state
        setEvents(prev => prev.map(e => e.id === selectedEvent.id ? calendarEvent : e));
        setHolidays(prev => prev.map(e => e.id === selectedEvent.id ? calendarEvent : e));

      } else {
        // Create new event
        const createRequest = calendarService.transformFormDataToCreateRequest(eventData);
        const newEvent = await calendarService.createEvent(createRequest);
        const calendarEvent = calendarService.transformToCalendarEvent(newEvent);

        // Update local state
        setEvents(prev => [...prev, calendarEvent]);
      }

      // Close form and reset state
      setEventFormOpen(false);
      setSelectedDate(undefined);
      setSelectedEvent(undefined);

    } catch (err) {
      // Failed to save event
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(selectedEvent ? `Failed to update event: ${errorMessage}` : `Failed to create event: ${errorMessage}`);
    }
  };

  const getDaysInPrevMonth = () => {
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    return prevMonthLastDay - firstDayWeekday + 1;
  };

  const isToday = (day: number) => {
    return today.getDate() === day &&
           today.getMonth() === currentMonth &&
           today.getFullYear() === currentYear;
  };

  const getEventForDay = (day: number) => {
    // Combine events and holidays
    const allEvents = [...events, ...holidays];
    return allEvents.find(event =>
      event.date.getDate() === day &&
      event.date.getMonth() === currentMonth &&
      event.date.getFullYear() === currentYear
    );
  };

  const renderCalendarGrid = () => {
    const days = [];

    // Previous month's trailing days
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const day = getDaysInPrevMonth() + i;
      days.push(
        <div key={`prev-${day}`} className="p-2 text-gray-400 text-sm flex flex-col h-full">
          {day}
        </div>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const event = getEventForDay(day);
      const dayDate = new Date(currentYear, currentMonth, day);
      days.push(
        <div
          key={day}
          onClick={() => handleAddEvent(dayDate)}
          className={`p-2 border border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex flex-col h-full ${
            isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
          }`}
          title={`Click to add event on ${dayDate.toLocaleDateString()}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            {day}
          </div>
          {event && (
            <div
              className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${
                event.type === 'holiday' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                event.type === 'meeting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                event.type === 'task' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                event.type === 'reminder' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
              }`}
              title={`${event.title} - Click to edit`}
              onClick={(e) => {
                e.stopPropagation();
                handleEditEvent(event);
              }}
            >
              {event.title}
            </div>
          )}
        </div>
      );
    }

    // Next month's leading days
    const totalCells = 42; // 6 rows x 7 days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="p-2 text-gray-400 text-sm flex flex-col h-full">
          {day}
        </div>
      );
    }

    return days;
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);

      const allEvents = [...events, ...holidays];
      const dayEvents = allEvents.filter(event =>
        event.date.toDateString() === day.toDateString()
      );

      days.push(
        <div key={i} className="border border-gray-200 dark:border-gray-700 min-h-[200px]">
          <div className={`p-2 border-b border-gray-200 dark:border-gray-700 font-medium ${
            day.toDateString() === today.toDateString() ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
          }`}>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {weekDays[day.getDay()]}
            </div>
            <div className="text-lg">
              {day.getDate()}
            </div>
          </div>
          <div className="p-2 space-y-1">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${
                  event.type === 'holiday' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                  event.type === 'meeting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                  event.type === 'task' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  event.type === 'reminder' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                }`}
                onClick={() => handleEditEvent(event)}
                title={`${event.title} - Click to edit`}
              >
                {event.title}
              </div>
            ))}
            <button
              className="text-xs text-gray-400 hover:text-gray-600 w-full text-left p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => handleAddEvent(day)}
            >
              + Add event
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-0 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center font-medium text-gray-500 dark:text-gray-400 border-b">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0">
          {days}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const allEvents = [...events, ...holidays];
    const dayEvents = allEvents.filter(event =>
      event.date.toDateString() === currentDate.toDateString()
    ).sort((a, b) => a.date.getTime() - b.date.getTime());

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div>
        <div className="text-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-0">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter(event =>
              event.date.getHours() === hour
            );

            return (
              <div key={hour} className="border-b border-gray-100 dark:border-gray-800 min-h-[60px] flex">
                <div className="w-16 p-2 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-800">
                  {`${hour.toString().padStart(2, '0')}:00`}
                </div>
                <div className="flex-1 p-2">
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-2 rounded mb-1 cursor-pointer hover:opacity-80 ${
                        event.type === 'holiday' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        event.type === 'meeting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        event.type === 'task' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        event.type === 'reminder' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                      }`}
                      onClick={() => handleEditEvent(event)}
                      title={`${event.title} - Click to edit`}
                    >
                      <div className="font-medium">{event.title}</div>
                      {event.location && <div className="text-xs opacity-75">{event.location}</div>}
                    </div>
                  ))}
                  <button
                    className="text-xs text-gray-400 hover:text-gray-600 w-full text-left p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => {
                      const eventDate = new Date(currentDate);
                      eventDate.setHours(hour, 0, 0, 0);
                      handleAddEvent(eventDate);
                    }}
                  >
                    + Add event at {`${hour.toString().padStart(2, '0')}:00`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    // Combine events and holidays
    const allEvents = [...events, ...holidays];
    const upcomingEvents = allEvents
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 10);

    return (
      <div className="space-y-4">
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No upcoming events
          </div>
        ) : (
          upcomingEvents.map(event => (
            <Card key={event.id} className="hover: transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {event.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded text-xs ${
                      event.type === 'holiday' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      event.type === 'meeting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      event.type === 'task' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      event.type === 'reminder' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                    }`}>
                      {event.type}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                        className="h-8 w-8 p-0"
                        title="Edit event"
                      >
                        Edit
                      </Button>
                      {event.type !== 'holiday' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          title="Delete event"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <TwoLevelLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="Calendar"
            description="Manage your events and schedules"
            breadcrumbs={[
              { label: "Calendar" }
            ]}
          />

          <div className="flex-1 overflow-hidden p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                  >
                    Month
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === 'day' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('day')}
                  >
                    Day
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </Button>
                </div>
              </div>

              <Button onClick={() => handleAddEvent()} className="bg-blue-600 hover:bg-blue-700">
                Add Event
              </Button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
              {/* Main Content - Calendar on Left */}
              <div className="lg:col-span-3 flex flex-col overflow-hidden">
                <Card className="flex-1 flex flex-col overflow-hidden">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        {getViewTitle()}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                          Prev
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                          Today
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto">
                    {error && (
                      <div className="text-center py-6">
                        <div className="text-red-500 mb-2">{error}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.reload()}
                        >
                          Retry
                        </Button>
                      </div>
                    )}

                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-pulse text-gray-500 dark:text-gray-400">
                          Loading calendar...
                        </div>
                      </div>
                    ) : (
                      viewMode === 'month' ? (
                        <div className="h-full flex flex-col">
                          {/* Week days header */}
                          <div className="grid grid-cols-7 gap-0 mb-2 flex-shrink-0">
                            {weekDays.map(day => (
                              <div key={day} className="p-3 text-center font-medium text-gray-500 dark:text-gray-400 border-b">
                                {day}
                              </div>
                            ))}
                          </div>
                          {/* Calendar grid with 6 equal rows */}
                          <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-0">
                            {renderCalendarGrid()}
                          </div>
                        </div>
                      ) : viewMode === 'week' ? (
                        renderWeekView()
                      ) : viewMode === 'day' ? (
                        renderDayView()
                      ) : (
                        renderListView()
                      )
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Navigation on Right */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Navigation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 overflow-auto">
                    {/* Mini Calendar for Previous Month */}
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        {months[prevMonth.getMonth()]} {prevMonth.getFullYear()}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-xs">
                        {weekDays.map(day => (
                          <div key={day} className="p-1 text-center font-medium text-gray-400">
                            {day[0]}
                          </div>
                        ))}
                        {Array.from({ length: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1).getDay() }, (_, i) => (
                          <div key={i} />
                        ))}
                        {Array.from({ length: new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate() }, (_, i) => (
                          <div key={i + 1} className="p-1 text-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mini Calendar for Next Month */}
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        {months[nextMonth.getMonth()]} {nextMonth.getFullYear()}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-xs">
                        {weekDays.map(day => (
                          <div key={day} className="p-1 text-center font-medium text-gray-400">
                            {day[0]}
                          </div>
                        ))}
                        {Array.from({ length: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1).getDay() }, (_, i) => (
                          <div key={i} />
                        ))}
                        {Array.from({ length: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate() }, (_, i) => (
                          <div key={i + 1} className="p-1 text-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Holidays */}
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Upcoming Holidays
                      </div>
                      <div className="space-y-2">
                        {loading ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
                        ) : holidays.length === 0 ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400">No holidays</div>
                        ) : (
                          holidays.slice(0, 3).map(holiday => (
                            <div key={holiday.id} className="text-sm">
                              <div className="font-medium">{holiday.title}</div>
                              <div className="text-gray-500 dark:text-gray-400">
                                {holiday.date.toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

      {/* Event Form Modal */}
      <EventForm
        open={eventFormOpen}
        onOpenChange={setEventFormOpen}
        onSubmit={handleEventSubmit}
        selectedDate={selectedDate}
        initialData={selectedEvent ? {
          title: selectedEvent.title,
          description: selectedEvent.description || '',
          date: selectedEvent.date,
          endDate: selectedEvent.endDate,
          location: selectedEvent.location || '',
          type: selectedEvent.type,
          priority: selectedEvent.priority,
          isAllDay: selectedEvent.isAllDay,
          attendees: selectedEvent.attendees
        } : undefined}
      />
      </TwoLevelLayout>
    </ProtectedRoute>
  );
}

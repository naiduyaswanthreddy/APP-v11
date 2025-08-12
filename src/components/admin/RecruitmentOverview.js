import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import {
    WorkOutline as WorkOutlineIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
 AttachMoney as AttachMoneyIcon,
    AttachMoney as DollarSignIcon, // Importing AttachMoneyIcon as DollarSignIcon
    CalendarToday as CalendarTodayIcon,
    HourglassEmpty as HourglassEmptyIcon,
    People as PeopleIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const RecruitmentOverview = ({ companyId, companyName, applications = [], jobs = [], totalJobsPosted, highestCTCOffered, averageCTCOffered }) => {
    const [stats, setStats] = useState({

        totalJobsPosted: 0,
        openPositions: 0,
        highestCTCOffered: 'N/A',
 averageCTCOffered: 'N/A',
        internshipStipendRange: 'N/A',
        applicationDeadlinesSoon: 0,
        totalApplications: 0,
        selectedStudentsCount: 0,
        pendingApplications: 0,
        shortlistedApplications: 0,
        rejectedApplications: 0
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecruitmentData = async () => {
            setLoading(true);
            setError(null);
            try {
                let openPositionsCount = 0;
                let totalCTCs = 0;
                let minStipend = Infinity;
                let maxStipend = 0;
                let deadlinesSoonCount = 0;

                const today = new Date();
                const sevenDaysFromNow = new Date();
                sevenDaysFromNow.setDate(today.getDate() + 7);
                
                const companyJobs = jobs; // Use provided jobs prop directly or fetched earlier

                // Process jobs data
                companyJobs.forEach((job) => {
                    if (job.status === 'open' || job.jobStatus === 'Open for Applications') {
                        openPositionsCount++;
                    }

                    if (job.ctc && typeof job.ctc === 'number') {
                        totalCTCs += job.ctc;
                    } else if (job.ctc && typeof job.ctc === 'string') {
                        const ctcValue = parseFloat(job.ctc);
                        if (!isNaN(ctcValue)) {
                            totalCTCs += ctcValue;
                        }
                    }

                    if (job.salary && typeof job.salary === 'number') { // Fix for salary calculation
                        totalCTCs += job.salary;
                    } else if (job.salary && typeof job.salary === 'string') {
                         const salaryValue = parseFloat(job.salary);
                         if (!isNaN(salaryValue)) {
                            totalCTCs += salaryValue;
                        }

                    }

                    if (job.applicationDeadline) {
                        const deadline = new Date(job.applicationDeadline.seconds ? 
                            job.applicationDeadline.seconds * 1000 : job.applicationDeadline);
                        if (deadline > today && deadline <= sevenDaysFromNow) {
                            deadlinesSoonCount++;
                        }
                    }
                });

                const companyApplications = applications; // Use provided applications prop directly

                // Calculate application statistics
                const totalApplications = companyApplications.length;
                const selectedStudentsCount = companyApplications.filter(app => app.status === 'selected').length;
                const pendingApplications = companyApplications.filter(app => !app.status || app.status === 'pending').length;
                const rejectedApplications = companyApplications.filter(app => app.status === 'rejected').length;
                const shortlistedApplications = companyApplications.filter(app => app.status === 'shortlisted').length;

                setStats({
                    openPositions: openPositionsCount, // Corrected typo
 averageCTCOffered: companyJobs.length > 0 ? `${(totalCTCs / companyJobs.length).toLocaleString()} LPA` : 'N/A',
                    internshipStipendRange: (minStipend !== Infinity && maxStipend > 0) ?
                        `${minStipend} - ${maxStipend} /month` : 'N/A',
                    applicationDeadlinesSoon: deadlinesSoonCount,
                    totalApplications: totalApplications,
                    selectedStudentsCount: selectedStudentsCount,
                    pendingApplications: pendingApplications,
                    rejectedApplications: rejectedApplications,
                    shortlistedApplications: shortlistedApplications
                });

            } catch (err) {
                console.error("Error fetching recruitment data:", err);
                setError("Failed to load recruitment data.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecruitmentData();    }, [companyId, companyName, jobs, applications]); // companyName might not be needed if jobs is always provided

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    const statCards = [
        { // Added card for total jobs posted
            title: "Total Jobs Posted",
            value: totalJobsPosted || 0,
            icon: <WorkOutlineIcon color="primary" />,
        },
        {
            title: "Open Positions",
            value: stats.openPositions,
            icon: <CheckCircleOutlineIcon color="success" />,
        },
        {
            title: "Total Applications",
            value: stats.totalApplications,
            icon: <PeopleIcon color="info" />,
        },
        {
            title: "Selected Students",
            value: stats.selectedStudentsCount,
            icon: <TrendingUpIcon color="success" />,
        },
        {
            title: "Pending Applications",
            value: stats.pendingApplications,
            icon: <HourglassEmptyIcon color="warning" />,
        },
        {
            title: "Highest CTC Offered",
            value: highestCTCOffered ? `₹${highestCTCOffered.toLocaleString()} LPA` : 'N/A',
            icon: <AttachMoneyIcon color="action" />,
        },
         {
            title: "Average CTC Offered", // Corrected title
            value: averageCTCOffered ? `₹${averageCTCOffered.toLocaleString()} LPA` : 'N/A',
            icon: <DollarSignIcon color="success" />, // Using DollarSignIcon for average
        },
        {
            title: "Shortlisted",
            value: stats.shortlistedApplications,
            icon: <CheckCircleOutlineIcon color="info" />,
        },
        {
            title: "Rejected",
            value: stats.rejectedApplications,
            icon: <HourglassEmptyIcon color="error" />,
        },
    ];

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
            {statCards.map((card, index) => (
                <Card key={index} raised>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                            {card.icon}
                            <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                                {card.title}
                            </Typography>
                        </Box>
                        <Typography variant="h4" color="text.secondary">
                            {card.value}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default RecruitmentOverview;

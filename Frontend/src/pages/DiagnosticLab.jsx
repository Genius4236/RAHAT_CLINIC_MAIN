import React, { useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import ScienceIcon from '@mui/icons-material/Science';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const tests = [
    {
        title: 'Complete Blood Count (CBC)',
        icon: <BloodtypeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />,
        description: 'A comprehensive blood test to evaluate your overall health and detect a wide ranges of disorders, including anemia and infection.',
        price: '₹500',
        tags: ['Blood', 'General Health'],
    },
    {
        title: 'Blood Sugar (Fasting & PP)',
        icon: <ScienceIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />,
        description: 'Measure your blood glucose levels after fasting and post-meal to screen for prediabetes and diabetes.',
        price: '₹300',
        tags: ['Diabetes', 'Metabolism'],
    },
    {
        title: 'Blood Pressure Check (BP)',
        icon: <MonitorHeartIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />,
        description: 'Routine blood pressure screening and monitoring to help prevent or manage hypertension effectively.',
        price: '₹100',
        tags: ['Heart', 'Vitals'],
    },
    {
        title: 'Thyroid Profile',
        icon: <LocalHospitalIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />,
        description: 'Evaluate thyroid gland function and help diagnose thyroid disorders like hyperthyroidism or hypothyroidism.',
        price: '₹800',
        tags: ['Hormones', 'Gland'],
    },
    {
        title: 'Lipid Profile',
        icon: <MedicalServicesIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />,
        description: 'Measures the levels of specific lipids in blood to evaluate cardiovascular health and risk of heart disease.',
        price: '₹600',
        tags: ['Heart', 'Cholesterol'],
    },
    {
        title: 'RTPCR / Viral Screening',
        icon: <CoronavirusIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />,
        description: 'Check for various infectious diseases including viral tests to make sure you are in perfectly good health.',
        price: '₹1200',
        tags: ['Viruses', 'Infection'],
    },
];

export default function DiagnosticLab() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const [paymentLoading, setPaymentLoading] = useState(null);

    const loadRazorpayScript = () =>
        new Promise((resolve, reject) => {
            if (document.getElementById('razorpay-script')) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.id = 'razorpay-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });

    const handleBookTest = async (test) => {
        if (!isLoggedIn) {
            alert("Please login first to book a test");
            navigate('/login');
            return;
        }

        const rawPrice = test.price.replace(/[^0-9]/g, '');
        const amount = Number(rawPrice);

        setPaymentLoading(test.title);
        try {
            await loadRazorpayScript();
            const keyRes = await api.getPaymentKey();
            const { order } = await api.createPaymentOrder(null, amount, 'LabTest', `Payment for ${test.title}`);

            const options = {
                key: keyRes.key,
                amount: order.amount,
                currency: order.currency || 'INR',
                name: 'Rahat Clinic',
                description: `Payment for ${test.title}`,
                order_id: order.id,
                handler: async (response) => {
                    try {
                        await api.verifyPayment(
                            response.razorpay_payment_id,
                            response.razorpay_order_id,
                            response.razorpay_signature,
                            null
                        );
                        alert('Payment successful! Your test is booked. We will contact you soon for sample collection.');
                    } catch (err) {
                        alert(err.message || 'Payment verification failed');
                    } finally {
                        setPaymentLoading(null);
                    }
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => {
                alert('Payment failed. Please try again.');
                setPaymentLoading(null);
            });
            rzp.open();
        } catch (err) {
            alert(err.message || 'Could not start payment');
            setPaymentLoading(null);
        }
    };

    return (
        <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                        Diagnostic <Typography component="span" variant="h2" color="primary.main" fontWeight="bold">Lab</Typography>
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
                        Book reliable, fast, and highly accurate laboratory tests covering a comprehensive spectrum of diagnostic requirements. Walk in today or book an appointment for sample collection.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {tests.map((test, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 4,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: '0.3s',
                                    '&:hover': { transform: 'translateY(-8px)', boxShadow: 6, borderColor: 'primary.main' }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    {test.icon}
                                    <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                                        {test.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                        {test.tags.map((tag, idx) => (
                                            <Chip key={idx} label={tag} size="small" variant="filled" sx={{ bgcolor: 'background.default', fontWeight: 'bold' }} />
                                        ))}
                                    </Box>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                                        {test.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mt: 'auto' }}>
                                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                                            {test.price}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            sx={{ borderRadius: 2 }}
                                            disabled={paymentLoading === test.title}
                                            onClick={() => handleBookTest(test)}
                                        >
                                            {paymentLoading === test.title ? 'Processing...' : 'Book Test'}
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ mt: 8, p: 4, bgcolor: 'primary.light', borderRadius: 4, textAlign: 'center', color: 'primary.contrastText', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h4" fontWeight="bold">Can't find your specific test?</Typography>
                    <Typography variant="h6" opacity={0.9} maxWidth={600}>
                        Upload your doctor's prescription so our lab technicians can arrange the exact tests needed for your profile.
                    </Typography>
                    <Button variant="contained" color="secondary" size="large" sx={{ mt: 2, px: 4 }}>
                        Upload Prescription
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}

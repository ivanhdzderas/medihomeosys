import React, { useState, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Typography, Button, Paper } from '@mui/material';
import BasicInfoForm from './BasicInfoForm';
import FamilyHistoryForm from './FamilyHistoryForm';
import PathologicalHistoryForm from './PathologicalHistoryForm';
import NonPathologicalHistoryForm from './NonPathologicalHistoryForm';
import GynecologicalHistoryForm from './GynecologicalHistoryForm';
import config from '../confi';

const baseSteps = [
    'Información Básica',
    'Antecedentes Familiares',
    'Antecedentes Patológicos',
    'Antecedentes No Patológicos',
];

const AddPatientStepper = ({ handleClose, reload, closeall }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [patientData, setPatientData] = useState({
        basicInfo: {},
        familyHistory: [],
        pathologicalHistory: [],
        nonPathologicalHistory: [],
        gynecologicalHistory: []
    });
    
    // El sexo ahora lo obtenemos del estado completo del paciente
    const gender = patientData.basicInfo?.sexo || '';

    const currentSteps = gender === 'Hombre'
        ? baseSteps
        : [...baseSteps, 'Antecedentes Ginecológicos'];
    
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };
    
    // Esta función recibe los datos completos del formulario y avanza al siguiente paso
    const handleSaveBasicInfo = (data) => {
        setPatientData((prevState) => ({ ...prevState, basicInfo: data }));
        handleNext();
    };

    const handleSaveFamilyHistory = (data) => {
        setPatientData((prevState) => ({ ...prevState, familyHistory: data }));
        handleNext();
    };

    const handleSavePathologicalHistory = (data) => {
        setPatientData((prevState) => ({ ...prevState, pathologicalHistory: data }));
        handleNext();
    };

    const handleSaveNonPathologicalHistory = (data) => {
        setPatientData((prevState) => ({ ...prevState, nonPathologicalHistory: data }));
        handleNext();
    };

    const handleSaveGynecologicalHistory = (data) => {
        setPatientData((prevState) => ({ ...prevState, gynecologicalHistory: data }));
        handleNext();
    };

    useEffect(() => {
        if (activeStep === currentSteps.length) {
            fetch(`${config.API_BASE_URL}/guardapaciente`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(patientData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                handleReset();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    }, [activeStep, patientData, currentSteps]);

    const handleReset = () => {
        setActiveStep(0);
        setPatientData({
            basicInfo: {},
            familyHistory: [],
            pathologicalHistory: [],
            nonPathologicalHistory: [],
            gynecologicalHistory: []
        });
        closeall();
        reload();
    };

    const StepContentComponent = ({ step }) => {
        switch (currentSteps[step]) {
            case 'Información Básica':
                return <BasicInfoForm onSave={handleSaveBasicInfo} patientData={patientData} />;
            case 'Antecedentes Familiares':
                return <FamilyHistoryForm onSave={handleSaveFamilyHistory} patientData={patientData} />;
            case 'Antecedentes Patológicos':
                return <PathologicalHistoryForm onSave={handleSavePathologicalHistory} patientData={patientData} />;
            case 'Antecedentes No Patológicos':
                return <NonPathologicalHistoryForm onSave={handleSaveNonPathologicalHistory} patientData={patientData} />;
            case 'Antecedentes Ginecológicos':
                return <GynecologicalHistoryForm onSave={handleSaveGynecologicalHistory} patientData={patientData} />;
            default:
                return <Typography>Desconocido</Typography>;
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Stepper 
                activeStep={activeStep} 
                alternativeLabel 
                sx={{ 
                    flexWrap: 'wrap', 
                    '& .MuiStepLabel-label': {
                        textAlign: 'center',
                        whiteSpace: 'normal'
                    } 
                }}
            >
                {currentSteps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Box sx={{ mt: 3 }}>
                {activeStep === currentSteps.length ? (
                    <Paper square elevation={0} sx={{ p: 3, backgroundColor: 'transparent' }}>
                        <Typography>Paciente agregado exitosamente</Typography>
                    </Paper>
                ) : (
                    <>
                        <StepContentComponent step={activeStep} />
                        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                            <Button
                                color="inherit"
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                sx={{ mr: 1 }}
                            >
                                Atrás
                            </Button>
                            <Box sx={{ flex: '1 1 auto' }} />
                            {activeStep === 0 && (
                                <Button type="submit" form="basic-info-form">
                                    Siguiente
                                </Button>
                            )}
                            {activeStep > 0 && activeStep < currentSteps.length && (
                                <Button onClick={handleNext}>
                                    {activeStep === currentSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
                                </Button>
                            )}
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default AddPatientStepper;
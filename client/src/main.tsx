import React from "react";
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, RouterProvider,Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import LinkDrop from "./components/LinkDrop";
import AiChatBox from "./components/AiChatBox"
import Loading from "./components/Loading";
import SignupPage from "./components/Authentication/SignupPage";
import LoginPage from "./components/Authentication/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import GoogleCallback from "./components/GoogleCallback";
const router = createBrowserRouter(
    createRoutesFromElements(
        <>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/signup" element={<SignupPage/>}/>
        <Route 
            path="/pastelink" 
            element={
                <ProtectedRoute>
                    <LinkDrop/>
                </ProtectedRoute>
            }
        />
        <Route 
            path="/chatbox" 
            element={
                <ProtectedRoute>
                    <AiChatBox/>
                </ProtectedRoute>
            }
        />
        <Route
            path="/chatbox/:jobId"
            element={
                <ProtectedRoute>
                    <AiChatBox/>
                </ProtectedRoute>
            }
        />
        <Route
            path="/chatbox/:jobId/:conversationId"
            element={
                <ProtectedRoute>
                    <AiChatBox/>
                </ProtectedRoute>
            }
        />
        <Route
            path="/chat/:jobId"
            element={
                <ProtectedRoute>
                    <AiChatBox/>
                </ProtectedRoute>
            }
        />
        <Route 
            path="/loading/:jobId" 
            element={
                <ProtectedRoute>
                    <Loading />
                </ProtectedRoute>
            }
        />
        
        </>
        
    )
)


createRoot(document.getElementById('root')!).render(
    
        <RouterProvider router = {router}/>
    
       
    
    
    
)

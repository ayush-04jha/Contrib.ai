export const logout = async (req, res) => {
    try {
        // Clear the cookie
        res.clearCookie('token', {
            domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined,
            path: '/'
        });
        
        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Logout Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
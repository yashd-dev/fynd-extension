"use client";
import axios from 'axios';
import { useEffect } from 'react';

export default function InventoryFetcher() {
    useEffect(() => {
        const fetchInventories = async () => {
            const accessToken = localStorage.getItem('fynd_access_token');
            const companyId = localStorage.getItem('fynd_company_id');


            if (!accessToken || !companyId) {
                console.error('Missing token or company ID');
                return;
            }

            try {
                const response = await axios.post('/api/products', {
                    accessToken,
                    companyId,
                });

                console.log('Inventories:', response.data);
            } catch (error) {
                console.error('Failed to fetch inventories:', error);
            }
        };

        fetchInventories();
    }, []);

    return <div>Loading Products...</div>;
}

"use client";
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams from next/navigation

const InstallPage = () => {
  const searchParams = useSearchParams(); // Use useSearchParams hook

  useEffect(() => {
    const company_id = searchParams.get('company_id'); // Get individual query parameters
    const cluster_url = searchParams.get('cluster_url');
    const client_id = searchParams.get('client_id');

    if (
      typeof company_id === 'string' &&
      typeof cluster_url === 'string' &&
      typeof client_id === 'string'
    ) {
      const redirect_uri = 'https://naitiklodha.xyz'; // Replace with your redirect URI
      const response_type = 'code';
      const scope = 'offline_access'; // Customize scope
      const state = Math.random().toString(36).substring(2, 15);

      const authorizeUrl = `${cluster_url}/service/panel/authentication/v1.0/company/${company_id}/oauth/authorize`;

      const params = new URLSearchParams({
        client_id,
        redirect_uri,
        response_type,
        scope,
        state,
      });

      console.log('Redirecting to:', `${authorizeUrl}?${params.toString()}`);
        // Uncomment the line below to perform the redirect
        console.log(company_id, client_id, cluster_url);

    //   window.location.href = `${authorizeUrl}?${params.toString()}`;
    }
  }, [searchParams]); // Depend on searchParams

  return <p>Redirecting to Fynd OAuth...</p>;
};

export default InstallPage;
'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/useToast';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatINR, formatDate, formatNumber } from '@/lib/utils';
import type { ReelAnalytics } from '@/types';

interface ExportButtonProps {
  reels: ReelAnalytics[];
}

export function ExportButton({ reels }: ExportButtonProps) {
  const { success, error } = useToast();
  const [exporting, setExporting] = useState(false);

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const workbook = XLSX.utils.book_new();
      
      // Reels data sheet
      const reelsData = reels.map((reel, index) => ({
        Rank: index + 1,
        'Reel URL': reel.reel_url,
        Username: reel.username,
        Title: reel.title || '',
        Description: reel.description || '',
        Hashtags: reel.hashtags?.join(', ') || '',
        'Full Caption': reel.full_caption || '',
        'Organic Views': reel.organic_views,
        'Organic Likes': reel.organic_likes,
        'Organic Comments': reel.organic_comments,
        'Organic Plays': reel.organic_plays,
        'Promotion Spend': reel.total_promotion_spend,
        'Promotion Views': reel.total_promotion_views,
        'Promotion Clicks': reel.total_promotion_clicks,
        'Promotion Impressions': reel.total_promotion_impressions,
        'Promotion Engagement': reel.total_promotion_engagement,
        'Total Views': reel.total_views,
        'Total Engagement': reel.total_engagement,
        'Engagement Rate (%)': reel.engagement_rate,
        'Cost per 1K Views': reel.cost_per_1k_views,
        Duration: reel.duration_seconds ? `${reel.duration_seconds}s` : '',
        'Published Date': reel.published_date,
      }));

      const worksheet = XLSX.utils.json_to_sheet(reelsData);
      
      // Set column widths
      const cols = [
        { wch: 6 },   // Rank
        { wch: 50 },  // Reel URL
        { wch: 20 },  // Username
        { wch: 30 },  // Title
        { wch: 40 },  // Description
        { wch: 30 },  // Hashtags
        { wch: 50 },  // Full Caption
        { wch: 15 },  // Organic Views
        { wch: 15 },  // Organic Likes
        { wch: 15 },  // Organic Comments
        { wch: 15 },  // Organic Plays
        { wch: 18 },  // Promotion Spend
        { wch: 18 },  // Promotion Views
        { wch: 18 },  // Promotion Clicks
        { wch: 20 },  // Promotion Impressions
        { wch: 22 },  // Promotion Engagement
        { wch: 15 },  // Total Views
        { wch: 20 },  // Total Engagement
        { wch: 18 },  // Engagement Rate
        { wch: 18 },  // Cost per 1K Views
        { wch: 10 },  // Duration
        { wch: 15 },  // Published Date
      ];
      worksheet['!cols'] = cols;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reels Analytics');

      // Summary sheet
      const totalSpend = reels.reduce((sum, r) => sum + r.total_promotion_spend, 0);
      const totalViews = reels.reduce((sum, r) => sum + r.total_views, 0);
      const totalEngagement = reels.reduce((sum, r) => sum + r.total_engagement, 0);
      const avgEngagementRate = reels.length > 0 
        ? reels.reduce((sum, r) => sum + r.engagement_rate, 0) / reels.length 
        : 0;

      const summaryData = [
        { Metric: 'Total Reels', Value: reels.length },
        { Metric: 'Total Promotion Spend', Value: formatINR(totalSpend) },
        { Metric: 'Total Views', Value: formatNumber(totalViews) },
        { Metric: 'Total Engagement', Value: formatNumber(totalEngagement) },
        { Metric: 'Average Engagement Rate', Value: `${avgEngagementRate.toFixed(2)}%` },
        { Metric: 'Export Date', Value: new Date().toLocaleString() },
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 30 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      XLSX.writeFile(workbook, `insta-reel-analytics-${formatDate(new Date())}.xlsx`);
      success('Excel file exported successfully!');
    } catch (err) {
      error('Failed to export Excel file');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF('landscape');
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(225, 48, 108); // Instagram pink
      doc.text('InstaReel Analytics Report', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 28);
      doc.text(`Total Reels: ${reels.length}`, 14, 34);

      // Summary table
      const totalSpend = reels.reduce((sum, r) => sum + r.total_promotion_spend, 0);
      const totalViews = reels.reduce((sum, r) => sum + r.total_views, 0);
      const totalEngagement = reels.reduce((sum, r) => sum + r.total_engagement, 0);

      autoTable(doc, {
        startY: 42,
        head: [['Metric', 'Value']],
        body: [
          ['Total Promotion Spend', formatINR(totalSpend)],
          ['Total Views', formatNumber(totalViews)],
          ['Total Engagement', formatNumber(totalEngagement)],
          ['Avg Engagement Rate', `${(reels.reduce((s, r) => s + r.engagement_rate, 0) / (reels.length || 1)).toFixed(2)}%`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [225, 48, 108] },
      });

      // Reels table
      const tableData = reels.slice(0, 50).map((reel, index) => [
        index + 1,
        reel.title?.substring(0, 30) || 'Untitled',
        reel.username,
        formatNumber(reel.total_views),
        formatNumber(reel.organic_likes),
        formatNumber(reel.organic_comments),
        `${reel.engagement_rate}%`,
        formatINR(reel.total_promotion_spend),
        reel.cost_per_1k_views > 0 ? formatINR(reel.cost_per_1k_views) : 'N/A',
        formatDate(reel.published_date),
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Rank', 'Title', 'Creator', 'Views', 'Likes', 'Comments', 'Engagement', 'Spend', 'CPM', 'Published']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [225, 48, 108], fontSize: 8 },
        styles: { fontSize: 7, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 45 },
          2: { cellWidth: 25 },
          3: { cellWidth: 22 },
          4: { cellWidth: 18 },
          5: { cellWidth: 18 },
          6: { cellWidth: 18 },
          7: { cellWidth: 25 },
          8: { cellWidth: 22 },
          9: { cellWidth: 22 },
        },
      });

      doc.save(`insta-reel-analytics-${formatDate(new Date())}.pdf`);
      success('PDF report exported successfully!');
    } catch (err) {
      error('Failed to export PDF');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting} loading={exporting}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Dashboard Data</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export to Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export to PDF (.pdf)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
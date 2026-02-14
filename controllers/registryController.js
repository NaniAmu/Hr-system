/**
 * Registry / PDF Export Controller
 * Department employee registry (government-style layout) - real data only
 */

const PDFDocument = require('pdfkit');
const Department = require('../models/Department');
const Employee = require('../models/Employee');

function formatDate(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

class RegistryController {
  /**
   * Department employee registry PDF
   * GET /api/departments/:id/registry.pdf
   */
  async departmentRegistryPdf(req, res) {
    try {
      const { id } = req.params;
      const department = await Department.findById(id).populate('headEmployeeId', 'fullName email employeeCode');
      if (!department) {
        return res.status(404).json({
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Department not found',
          action: 'Check department ID'
        });
      }

      const employees = await Employee.find({
        departmentId: id,
        status: { $ne: 'INACTIVE' }
      })
        .select('employeeCode fullName email phone profession position status')
        .sort({ fullName: 1 });

      // Stream PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="department-registry-${department.code}-${formatDate()}.pdf"`
      );

      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      doc.pipe(res);

      // Header
      doc.fontSize(14).font('Helvetica-Bold').text('GOVERNMENT HR MANAGEMENT SYSTEM', { align: 'center' });
      doc.moveDown(0.25);
      doc.fontSize(12).font('Helvetica-Bold').text('DEPARTMENT EMPLOYEE REGISTRY', { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Department: ${department.name} (${department.code})`);
      doc.text(`Registry Date: ${formatDate()}`);
      doc.text(
        `Department Head: ${department.headEmployeeId?.fullName || 'Not assigned'}`
        + (department.headEmployeeId?.employeeCode ? ` (${department.headEmployeeId.employeeCode})` : '')
      );
      doc.moveDown(1);

      // Table layout
      const tableTop = doc.y;
      const col = {
        no: 48,
        code: 80,
        name: 150,
        email: 320,
        phone: 460
      };

      const rowHeight = 18;

      const drawRow = (y, row, isHeader = false) => {
        doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
        doc.text(String(row.no), col.no, y, { width: 28 });
        doc.text(row.employeeCode || '-', col.code, y, { width: 65 });
        doc.text(row.fullName || '-', col.name, y, { width: 165 });
        doc.text(row.email || '-', col.email, y, { width: 135 });
        doc.text(row.phone || '-', col.phone, y, { width: 90 });
      };

      // Header row
      drawRow(tableTop, { no: 'No.', employeeCode: 'Code', fullName: 'Full Name', email: 'Email', phone: 'Phone' }, true);
      doc.moveTo(48, tableTop + 14).lineTo(547, tableTop + 14).stroke();

      let y = tableTop + rowHeight;
      for (let i = 0; i < employees.length; i++) {
        if (y > 760) {
          doc.addPage();
          y = 60;
          drawRow(y, { no: 'No.', employeeCode: 'Code', fullName: 'Full Name', email: 'Email', phone: 'Phone' }, true);
          doc.moveTo(48, y + 14).lineTo(547, y + 14).stroke();
          y += rowHeight;
        }

        const emp = employees[i];
        drawRow(y, {
          no: i + 1,
          employeeCode: emp.employeeCode,
          fullName: emp.fullName,
          email: emp.email,
          phone: emp.phone || ''
        });
        y += rowHeight;
      }

      doc.moveDown(2);
      doc.fontSize(9).font('Helvetica');
      doc.text(`Total Employees Listed: ${employees.length}`);
      doc.moveDown(1);
      doc.text('Prepared By: ____________________________', { align: 'left' });
      doc.text('Approved By: ____________________________', { align: 'left' });

      doc.end();
    } catch (error) {
      console.error('Error generating department registry PDF:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate registry PDF',
        action: 'Contact administrator'
      });
    }
  }
}

module.exports = new RegistryController();


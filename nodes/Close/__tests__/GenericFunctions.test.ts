import { convertPlainTextToHTML } from '../GenericFunctions';

describe('GenericFunctions', () => {
	describe('convertPlainTextToHTML', () => {
		it('should wrap simple text in body and paragraph tags', () => {
			const input = 'Simple text';
			const expected = '<body><p>Simple text</p></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(expected);
		});

		it('should convert text with single newlines to paragraphs with br tags', () => {
			const input = 'Line 1\nLine 2\nLine 3';
			const expected = '<body><p>Line 1<br>Line 2<br>Line 3</p></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(expected);
		});

		it('should convert text with double newlines to multiple paragraphs', () => {
			const input = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3';
			const expected = '<body><p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(expected);
		});

		it('should convert lines starting with - to unordered list', () => {
			const input = '- Item 1\n- Item 2\n- Item 3';
			const expected = '<body><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(expected);
		});

		it('should convert lines starting with * to unordered list', () => {
			const input = '* Item 1\n* Item 2\n* Item 3';
			const expected = '<body><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(expected);
		});

		it('should handle mixed content with paragraphs and lists', () => {
			const input = 'Introduction text\n\n- List item 1\n- List item 2\n\nConclusion text';
			const expected = '<body><p>Introduction text</p><ul><li>List item 1</li><li>List item 2</li></ul><p>Conclusion text</p></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(expected);
		});

		it('should handle list items with extra spaces', () => {
			const input = '-   Item with spaces\n-  Another item\n- Normal item';
			const expected = '<body><ul><li>Item with spaces</li><li>Another item</li><li>Normal item</li></ul></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(expected);
		});

		it('should return text as-is if it already contains body tags', () => {
			const input = '<body><p>Already formatted</p></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(input);
		});

		it('should return text as-is if it contains body tag with attributes', () => {
			const input = '<body class="test"><p>Already formatted</p></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(input);
		});

		it('should handle empty lines between list items', () => {
			const input = '- Item 1\n\n- Item 2\n\n- Item 3';
			const expected = '<body><ul><li>Item 1</li></ul><ul><li>Item 2</li></ul><ul><li>Item 3</li></ul></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(expected);
		});

		it('should handle complex text like the user example', () => {
			const input = `Simatic Unternehmenshintergrund und Kontaktanbahnung

- Der Besuch erfolgte im Simatic Showroom in Bad Homburg.
- Die Einladung an den Geschäftsführer Joachim Krampe wurde an seinen anwesenden Vertreter übergeben.
- Der Vertreter sagte zu, die Einladung an Herrn Krampe weiterzuleiten, weitere Kontaktaufnahme wird erwartet.

Potenziale für Personalgewinnung und Kundenakquise

- Aufgrund krankheitsbedingter Ausfälle besteht aktuell Personalbedarf.
- Die geringe Besucherfrequenz im Showroom indiziert Verbesserungspotenzial.`;

			const result = convertPlainTextToHTML(input);

			// Verify it contains body tags
			expect(result).toMatch(/^<body>.*<\/body>$/);
			// Verify it contains the paragraph title
			expect(result).toContain('<p>Simatic Unternehmenshintergrund und Kontaktanbahnung</p>');
			// Verify it contains list items
			expect(result).toContain('<ul>');
			expect(result).toContain('<li>Der Besuch erfolgte im Simatic Showroom in Bad Homburg.</li>');
			expect(result).toContain('<li>Die Einladung an den Geschäftsführer');
			// Verify it contains the second paragraph
			expect(result).toContain('<p>Potenziale für Personalgewinnung und Kundenakquise</p>');
			// Verify second list
			expect(result).toContain('<li>Aufgrund krankheitsbedingter Ausfälle besteht aktuell Personalbedarf.</li>');
		});

		it('should handle text with only whitespace by returning body with empty content', () => {
			const input = '   \n\n   ';
			const expected = '<body></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(expected);
		});

		it('should trim whitespace from lines', () => {
			const input = '  Line 1  \n  Line 2  ';
			const expected = '<body><p>Line 1<br>Line 2</p></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(expected);
		});

		it('should handle multiple consecutive newlines as paragraph separator', () => {
			const input = 'Para 1\n\n\n\nPara 2';
			const expected = '<body><p>Para 1</p><p>Para 2</p></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(expected);
		});

		it('should preserve inline HTML tags in text', () => {
			const input = 'Text with <strong>bold</strong> and <em>italic</em>';
			const expected = '<body><p>Text with <strong>bold</strong> and <em>italic</em></p></body>';
			const result = convertPlainTextToHTML(input);
			expect(result).toBe(expected);
		});

		it('should handle mixed list types in same block', () => {
			const input = '- Dash item\n* Star item';
			// Both - and * should be treated as list items
			const result = convertPlainTextToHTML(input);
			expect(result).toContain('<ul>');
			expect(result).toContain('<li>Dash item</li>');
			expect(result).toContain('<li>Star item</li>');
			expect(result).toContain('</ul>');
		});

		it('should handle real-world example with German text and special characters', () => {
			const input = 'Geschäftsführer Joachim Krampe\n\n- Überprüfung der Möglichkeiten\n- Verbesserungspotenzial für Kundenakquise';
			const result = convertPlainTextToHTML(input);

			expect(result).toContain('<p>Geschäftsführer Joachim Krampe</p>');
			expect(result).toContain('<ul>');
			expect(result).toContain('<li>Überprüfung der Möglichkeiten</li>');
			expect(result).toContain('<li>Verbesserungspotenzial für Kundenakquise</li>');
		});

		it('should handle text with inline HTML tags like strong', () => {
			const input = '<strong>Simatic Unternehmenshintergrund und Kontaktanbahnung</strong>\n- Der Besuch erfolgte im Simatic Showroom in Bad Homburg.\n- Die Einladung an den Geschäftsführer Joachim Krampe wurde an seinen anwesenden Vertreter übergeben.\n- Der Vertreter sagte zu, die Einladung an Herrn Krampe weiterzuleiten, weitere Kontaktaufnahme wird erwartet.\n- Simatic betreibt zwei Filialen (Bad Homburg und Kelkheim), beide unter der Leitung von Herrn Krampe.\n- Das Unternehmen scheint ein Familienunternehmen zu sein, da eine zweite Person mit dem Namen Krampe im Team vertreten ist (Daniel Krampe, Name ohne Gewähr).\n\n<strong>Potenziale für Personalgewinnung und Kundenakquise</strong>\n- Aufgrund krankheitsbedingter Ausfälle besteht aktuell Personalbedarf, wodurch Social Recruiting oder Personalbeschaffung ein potenzieller Angriffspunkt darstellt.\n- Die geringe Besucherfrequenz im Showroom (Eingangstür war versperrt) indiziert Verbesserungspotenzial in der Kundenakquise.\n- Eine Steigerung der Besucheranzahl im Showroom ist ein möglicher Ansatzpunkt.';
			const result = convertPlainTextToHTML(input);

			// Verify it starts with body tag
			expect(result).toMatch(/^<body>/);
			expect(result).toMatch(/<\/body>$/);

			// Verify the strong tags are preserved
			expect(result).toContain('<strong>Simatic Unternehmenshintergrund und Kontaktanbahnung</strong>');
			expect(result).toContain('<strong>Potenziale für Personalgewinnung und Kundenakquise</strong>');

			// This text has a single newline between the strong tag and the list items
			// So it should be treated as a single paragraph with <br> tags
			expect(result).toContain('<p><strong>Simatic Unternehmenshintergrund und Kontaktanbahnung</strong><br>- Der Besuch erfolgte');

			// The second section also has single newlines, so same behavior
			expect(result).toContain('<p><strong>Potenziale für Personalgewinnung und Kundenakquise</strong><br>- Aufgrund krankheitsbedingter');
		});
	});
});

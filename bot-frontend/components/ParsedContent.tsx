import React from 'react';

interface ParsedContentProps {
  content: string;
  messageType?: 'booking' | 'info' | 'event' | 'ticket' | 'guide' | 'benefits' | 'exhibition';
}

const ParsedContent: React.FC<ParsedContentProps> = ({ content, messageType }) => {
  // Helper function to parse AI response
  const parseResponse = (content: string) => {
    // Remove markdown artifacts
    let cleaned = content
      .replace(/#+/g, '') // Remove ##, ###
      .replace(/\*\*/g, '') // Remove **
      .replace(/^\* /gm, '') // Remove leading * for bullets
      .replace(/^\- /gm, '') // Remove leading - for bullets
      .replace(/^\• /gm, '') // Remove leading • for bullets
      .trim();

    // Handle query prefix (e.g., "Upcoming Events: What special events...")
    if (cleaned.includes(':')) {
      cleaned = cleaned.split(':').slice(1).join(':').trim();
    }

    // Split into lines
    const lines = cleaned.split('\n').filter(line => line.trim());

    // Extract heading (first line)
    let heading = lines[0]?.trim() || 'Response';
    let bodyLines = lines.slice(1);

    // Parse body into sections
    const sections: { title: string; items: Array<{ title: string; details: string[] }> | string[] }[] = [];
    let currentSection = { title: '', items: [] as Array<{ title: string; details: string[] }> | string[] };
    let currentItem: { title: string; details: string[] } | null = null;

    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i].trim();
      // Detect section titles (e.g., "Workshops", "Specific Artifacts")
      if (
        line.match(/^[A-Z][a-zA-Z\s]+$/g) &&
        !line.includes(':') &&
        i < bodyLines.length - 1
      ) {
        if (currentSection.items.length || currentSection.title) {
          sections.push(currentSection);
          currentSection = { title: line, items: [] };
          currentItem = null;
        } else {
          currentSection.title = line;
        }
      } else if (line.includes(' - ') && !line.includes(': ') && currentSection.title !== 'Guided Tours') {
        // Handle items with descriptions (e.g., "Lecture Series: 'The Art of Renaissance' - Join us...")
        if (currentItem) {
          (currentSection.items as Array<{ title: string; details: string[] }>).push(currentItem);
        }
        const [title, ...description] = line.split(' - ');
        currentItem = { title: title.trim(), details: description.join(' - ').trim().split('. ').map(d => d.trim()).filter(d => d) };
      } else if (line.includes(': ') && (currentSection.title === 'Guided Tours' || line.match(/^(The\s|Ancient\s|Greek\s|Rare\s|Interactive\s)/))) {
        // Handle tours (e.g., "English: 11 AM, 1 PM, and 3 PM") or exhibits/artifacts (e.g., "The Art of Ancient Civilizations: Explore...")
        if (currentItem) {
          (currentSection.items as Array<{ title: string; details: string[] }>).push(currentItem);
          currentItem = null;
        }
        const [title, ...description] = line.split(': ');
        const details = description.join(': ').trim().split('. ').map(d => d.trim()).filter(d => d);
        if (currentSection.title === 'Guided Tours') {
          (currentSection.items as Array<{ title: string; details: string[] }>).push({
            title: title.trim(),
            details: [`Times: ${details.join(', ')}`]
          });
        } else {
          (currentSection.items as Array<{ title: string; details: string[] }>).push({
            title: title.trim(),
            details: details.length ? details : ['No description available.']
          });
        }
      } else if (line) {
        // Add to current item or section content
        if (currentItem) {
          currentItem.details.push(line);
        } else {
          (currentSection.items as string[]).push(line);
        }
      }
    }

    // Push the last item and section
    if (currentItem) {
      (currentSection.items as Array<{ title: string; details: string[] }>).push(currentItem);
    }
    if (currentSection.items.length || currentSection.title) {
      sections.push(currentSection);
    }

    return { heading, sections };
  };

  const { heading, sections } = parseResponse(content);

  return (
    <div className="space-y-6">
      {sections.length > 0 ? (
        sections.map((section, index) => (
          <div key={index} className="space-y-4">
            {section.title && (
              <h4 className="font-semibold text-lg text-gray-800">{section.title}</h4>
            )}
            {Array.isArray(section.items) && section.items.length > 0 ? (
              <div className="space-y-4">
                {section.items.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    {typeof item === 'object' && item !== null && 'title' in item ? (
                      <>
                        <h5 className="font-semibold text-base text-gray-800">{item.title}</h5>
                        {item.details.map((detail, dIdx) => {
                          // Extract key-value pairs for events (e.g., "Date: March 15th")
                          const parts = detail.split(/ - |: /);
                          if (parts.length > 1 && section.title !== 'Guided Tours') {
                            const [key, ...value] = detail.split(': ');
                            if (key.match(/Date|Time|Location/)) {
                              return (
                                <p key={dIdx} className="text-gray-700 text-base font-normal">
                                  <span className="font-medium">{key}:</span> {value.join(': ')}
                                </p>
                              );
                            }
                          }
                          return (
                            <p key={dIdx} className="text-gray-700 text-base font-normal">{detail}</p>
                          );
                        })}
                      </>
                    ) : (
                      <p className="text-gray-700 text-base font-normal">{item}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-700 text-base font-normal">No items available.</p>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-700 text-base font-normal">No content available.</p>
      )}
    </div>
  );
};

export default ParsedContent;
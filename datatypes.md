## UPDATED DATA TYPES

### 1. Options to display

For text layer types, show in the dropdown all the following options in two groups. 

NUMBERS
- Custom
- Percentage
- Phone
- Date
- Finances

TEXT
- Person
- Email
- Website
- Location
- Title
- Long text

For any other layer type, show in the dropdown:

MEDIA
- Avatar
- Image
- Color

### 2. Resources and custom options

When any of the the options above are selected, then we display custom configuration per each type. Here is more info about those configurations but also the sources for the data based on what we currently use:

NUMBERS
- Custom: This would be based on internal random numbers generation. The options inside already exist for the existing Random Numbers, which contains:
  - Checkbox to include format
  - Checkbox to include 2 decimals
  - Inputs for min and max values
  - Input for a prefix
  - Sorting logic (Random, ascending and descending)
  - On the top of what exists, I would love to also see a preview,  which is just one random number with all the selected rules being applied (Example: If the raw random number is 2372, and formatted, decimals and a prefix "$" has been added within a range, then the preview shows $2,372.00)
- Percentage: This would continue using internal random generation but for percentage, which means between 0 to 100 with a "%" sufix. Also include:
  - Checkbox to include 2 decimals
  - Same sorting logic as custom (Random, ascending and descending)
- Phone: This would use faker.js to generate random phone numbers. This would include
  - A dropdown to select among the options faker.js provides: Human input, National and International (be sure these options are included in the way we use faker.js)
- Date: This would use faker.js to generate random dates. This would include
  - A dropdown to select among format a types of dates:
    - MM/DD/YYYY
    - DD/MM/YYYY
    - YYYY/MM/DD
    - Year
    - Month
    - Week day
  - A sorting logic to include Random, Most recent, Oldest
  - In case faker.js doesn't provide all these format options directly, let's process what they give and format internally
- Finances: This soulw use faker.js to generate random finances pieces of data. This would include:
  - A dropdown to select among types of finance data:
    - Credit card (to display credit card number)
    - Account number
    - Bitcoin address
    - IBAN

TEXT
- Person: This would use faker.js and would include:
  - Input for a custom prefix
  - Input for a custom sufix
  - A dropdown to select among types of person data: 
    - Full name
    - First name
    - Last name
    - Username
    - Gender
    - Job title
    - Password
  - Let's verify if all can be covered by faker.js, or if we need any other solution for some piece of data that we could be missing
- Email: This would use faker.js and would include:
  - Input to customize the provider. Based on faker.js this is an option. In case is left empty, it would generate a random one
  - A sorting logic, which would include Random, A-Z and Z-A
- Website: This would use faker.js and would include:
  - Input to optionally override the domain sufix (.com, .org, etc). I'm not sure if this is an option with faker.js, so maybe we need to do it internally based on the websites faker.js could provide us
  - Sorting logic: Random, A-Z and Z-A
- Location: This would use faker.js and would include:
  - Dropdown to select type of location data:
    - City
    - Country
    - Full address
    - Street address
    - ZIP code
    - Country code
    - Coordinates
  - Sorting logic: Random, A-Z and Z-A
- Titles: This would mostly be covered by faker.js but some missing pieces might need to be handled with internal hardcoded data as part of the plugin. This would include:
  - Dropdown to select among types:
    - Post title (this might need internal data)
    - Company name
    - Product name
    - Food
    - Animal
    - Song title
    - Music artist
    - Random word (which generates a random word, I think faker.js can cover this but we need to validate)
  - Sorting logic: Random, A-Z and Z-A
- Long text: We need to handle this internally. My idea is to have a file with pieces of text collected from the internet that can be provide 3-5 variations of the selected categories. This option would include:
  - Dropdown to select from categories:
    - Any category (which would randomly select a text)
    - Technology
    - Biography
    - History
    - Nature
    - Medicine

MEDIA
- Avatar: We would need to use different resources for the internal option. Once select, this would include:
  - A dropdown to select avatar types:
    - Any avatar: it would use any avatar type randomly)
    - Real people: it should work as the current 👥 Real People Photos option
    - Only male:  it should work as the current 👨 Male Photos option
    - Only female: it should work as the current 👩 Female Photos option
    - Robots: it should work as the current 🤖 Robot Avatars option
    - Cartoon: it shoudl work as a the current 👤 Avatar (DiceBear) option
- Image: Ideally, would be great to use unsplash for good quality images, but we need to validate this working correctly (currently it's not, maybe because we are not using proxy for it) but also something that could allow us to do some basic filtering. This option should include:
  - A dropdow to select image categories
    - Any category: it would use any random image without filtering
    - Products: it would show product images. We need to research if unsplash can provide us the right filering, or if there is any other resource we could use for it
    - Landscapes: it would show only the landscape filtering
- Color: We can handle this internally by randomly generate for the categories. This option includes:
  - A dropdown to select from:
   - Solid color: Which would randomly apply a solid random color to the layer once is applied
   - Gradient: Which would randomly apply a linear gradient of two random colors

### 3. Implementation notes

Let's try to clean everything related to the data types so it adapts to this new structure we want to offer to users. Also, let's keep in mind that in the latest adjustments we started using proxy to workaround Figma API limitations, so in case we have so missing resource for any data type, let's research what we can use now with the proxy. 

Regarding the internal data we need to produce for the Long text option, I wonder if we can pull it from another file where we can have some type of dictionary where I can manually add the text to pull from basd on the given categories. If this is not possible, please suggest me another practical way to handle this that doesn't involve increasing the complexity of the ui.html file. I understand Figma has limitation when interacting between files.

Before moving forward, please share the implementation plan for this update.
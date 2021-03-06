# == Schema Information
#
# Table name: scraper_fields
#
#  id         :integer          not null, primary key
#  name       :string
#  selector   :string
#  type       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  scraper_id :integer
#

class ScraperFieldText < ScraperField
  def scrape(params)
    params[:html].css(self.selector).text
  rescue StandardError
    nil
  end
end

# == Schema Information
#
# Table name: websites
#
#  id                      :integer          not null, primary key
#  name                    :string
#  url                     :string
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  query_string_key_page   :string
#  query_string_key_search :string
#

class Website < ApplicationRecord
  has_many :website_pages
  has_one :scraper
end

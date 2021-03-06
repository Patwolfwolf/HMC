class CreatePictures < ActiveRecord::Migration[5.0]
  def change
    create_table :pictures do |t|
      t.string :title
      t.string :center
      t.string :scale
      t.string :extent
      t.string :url
      t.string :description

      t.timestamps
    end
  end
end
